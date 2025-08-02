// Updated VendorSelection.js with evaluated vendor check
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "../cssFiles/vendorSelection.css";

function VendorSelection() {
  const [vendors, setVendors] = useState([]);
  const [evaluatedVendors, setEvaluatedVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const vendorSnap = await getDocs(collection(db, "vendors"));
      const vendorList = vendorSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVendors(vendorList);

      const evalQuery = query(collection(db, "evaluations"), where("userId", "==", user.uid));
      const evalSnap = await getDocs(evalQuery);
      const evaluatedIds = evalSnap.docs.map((doc) => doc.data().vendorId);
      setEvaluatedVendors(evaluatedIds);
    };

    fetchData();
  }, []);

  const handleProceed = () => {
    const vendor = vendors.find((v) => v.name === selectedVendor);
    if (!vendor) return alert("Please choose a valid vendor.");
    if (evaluatedVendors.includes(vendor.id)) {
      return alert("✅ This vendor has already been evaluated.");
    }
    navigate(`/prequalification?vendorId=${vendor.id}&vendor=${encodeURIComponent(vendor.name)}`);
  };

  return (
    <div className="selection-wrapper">
      <h2>Select a Vendor to Evaluate</h2>
      <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
        <option value="">-- Choose Vendor --</option>
        {vendors.map((v) => (
          <option
            key={v.id}
            value={v.name}
            disabled={evaluatedVendors.includes(v.id)}
          >
            {v.name} {evaluatedVendors.includes(v.id) ? "(Already Evaluated)" : ""}
          </option>
        ))}
      </select>
      <button onClick={handleProceed} disabled={!selectedVendor} style={{ marginTop: 20 }}>
        Start Evaluation
      </button>
      <button
        style={{ marginTop: 10, backgroundColor: "#ccc", color: "#333" }}
        onClick={() => navigate("/dashboard")}
      >
        Exit to Dashboard
      </button>
    </div>
  );
}

export default VendorSelection;