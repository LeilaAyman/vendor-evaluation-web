import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cssFiles/newVendor.css";

function NewVendorEntry() {
  const [vendorName, setVendorName] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!vendorName.trim()) {
      alert("Please enter a vendor name.");
      return;
    }

    // Route to prequalification for new vendor type
    navigate(`/prequalificationnew?vendor=${encodeURIComponent(vendorName)}&type=new`);
  };

  return (
    <div className="entry-wrapper">
      <h2>Enter New Vendor Name</h2>
      <input
        type="text"
        value={vendorName}
        onChange={(e) => setVendorName(e.target.value)}
        placeholder="Vendor Name"
        className="vendor-input"
      />
      <button onClick={handleStart}>Proceed to Pre-Qualification</button>
      <button onClick={() => navigate("/dashboard")} className="back-button">
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default NewVendorEntry;
