import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "../cssFiles/vendorSelection.css";
import Swal from "sweetalert2"; // Using sweetalert2 for better alerts

function VendorSelection() {
  const [vendors, setVendors] = useState([]);
  const [evaluatedVendors, setEvaluatedVendors] = useState([]);
  const [discardedVendors, setDiscardedVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // Fetch all vendors
      const vendorQuery = query(collection(db, "vendors"), where("new", "==", false));
      const vendorSnap = await getDocs(vendorQuery);
      const vendorList = vendorSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVendors(vendorList);

      // Fetch already evaluated vendors
      const evalQuery = query(collection(db, "evaluations"), where("userId", "==", user.uid));
      const evalSnap = await getDocs(evalQuery);
      const evaluatedIds = evalSnap.docs.map((doc) => doc.data().vendorId);
      setEvaluatedVendors(evaluatedIds);

      // Fetch discarded vendors
      const discardQuery = query(collection(db, "discarded_vendors"), where("discardedBy", "==", user.uid));
      const discardSnap = await getDocs(discardQuery);
      const discardedIds = discardSnap.docs.map((doc) => doc.data().vendorId);
      setDiscardedVendors(discardedIds);
    };

    fetchData();
  }, []);

  const handleProceed = () => {
    const vendor = vendors.find((v) => v.name === selectedVendor);
    if (!vendor) {
      Swal.fire("Invalid Selection", "Please choose a valid vendor.", "warning");
      return;
    }

    if (discardedVendors.includes(vendor.id)) {
      Swal.fire("Vendor Discarded", "You cannot evaluate this vendor due to regulatory non-compliance.", "error");
      return;
    }

    if (evaluatedVendors.includes(vendor.id)) {
      Swal.fire("Already Evaluated", "✅ You have already evaluated this vendor.", "info");
      return;
    }

    navigate(`/prequalification?vendorId=${vendor.id}&vendor=${encodeURIComponent(vendor.name)}`);
  };

  return (
    <div className="selection-wrapper">
      <h2>Select a Vendor to Evaluate</h2>
      <select
        value={selectedVendor}
        onChange={(e) => setSelectedVendor(e.target.value)}
      >
        <option value="">-- Choose Vendor --</option>
        {vendors.map((v) => {
          const isEvaluated = evaluatedVendors.includes(v.id);
          const isDiscarded = discardedVendors.includes(v.id);
          return (
            <option key={v.id} value={v.name} disabled={isEvaluated || isDiscarded}>
              {v.name}
              {isEvaluated
                ? " (Already Evaluated)"
                : isDiscarded
                ? " (Discarded)"
                : ""}
            </option>
          );
        })}
      </select>

      <button
        onClick={handleProceed}
        disabled={!selectedVendor}
        style={{ marginTop: 20 }}
      >
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
