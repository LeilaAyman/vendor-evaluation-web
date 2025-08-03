import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/vendorSelection.css";

function NewVendorSelection() {
  const [newVendors, setNewVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewVendors = async () => {
      try {
        const q = query(collection(db, "vendors"), where("new", "==", true));
        const snap = await getDocs(q);
        const vendorList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNewVendors(vendorList);
      } catch (err) {
        console.error("Error fetching new vendors:", err);
      }
    };

    fetchNewVendors();
  }, []);

  const handleProceed = () => {
    const vendor = newVendors.find(v => v.name === selectedVendor);
    if (!vendor) {
      alert("Please select a vendor.");
      return;
    }

    // Route to new vendor prequalification
    navigate(`/prequalificationnew?vendor=${encodeURIComponent(vendor.name)}&type=new`);
  };

  return (
    <div className="selection-wrapper">
      <h2>Select a New Vendor to Evaluate</h2>
      <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
        <option value="">-- Choose Vendor --</option>
        {newVendors.map((v) => (
          <option key={v.id} value={v.name}>
            {v.name}
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
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default NewVendorSelection;
