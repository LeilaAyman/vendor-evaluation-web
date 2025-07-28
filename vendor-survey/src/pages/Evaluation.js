import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Evaluation() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      const querySnapshot = await getDocs(collection(db, "vendors"));
      const vendorList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVendors(vendorList);
    };
    fetchVendors();
  }, []);

  const handlePreQualify = () => {
    if (selectedVendor) {
      navigate(`/prequalification?vendor=${encodeURIComponent(selectedVendor)}`);
    }
  };

  return (
    <div className="page">
      <h2>Vendor Evaluation Setup</h2>

      <label>Select a Vendor:</label>
      <select
        value={selectedVendor}
        onChange={(e) => setSelectedVendor(e.target.value)}
      >
        <option value="">-- Choose Vendor --</option>
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.name}>
            {vendor.name}
          </option>
        ))}
      </select>

      {selectedVendor && (
        <button onClick={handlePreQualify} className="submit-btn" style={{ marginTop: "20px" }}>
          Proceed to Pre-Qualification
        </button>
      )}
    </div>
  );
}

export default Evaluation;
