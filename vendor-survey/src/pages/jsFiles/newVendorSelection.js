import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import Swal from "sweetalert2";
import "../cssFiles/vendorSelection.css";

function NewVendorSelection() {
  const [newVendors, setNewVendors] = useState([]);
  const [evaluatedVendors, setEvaluatedVendors] = useState([]);
  const [discardedVendors, setDiscardedVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch vendors marked as new
        const q = query(collection(db, "vendors"), where("new", "==", true));
        const snap = await getDocs(q);
        const vendorList = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNewVendors(vendorList);

        // Evaluated vendors
        const evalQuery = query(
          collection(db, "evaluations"),
          where("userId", "==", user.uid)
        );
        const evalSnap = await getDocs(evalQuery);
        const evaluatedIds = evalSnap.docs.map((doc) => doc.data().vendorId);
        setEvaluatedVendors(evaluatedIds);

        // Discarded vendors using vendorName
        const discardQuery = query(
          collection(db, "discarded_new_vendors"),
          where("discardedBy", "==", user.uid)
        );
        const discardSnap = await getDocs(discardQuery);
        const discardedNames = discardSnap.docs.map((doc) =>
          doc.data().vendorName?.toLowerCase()
        );
        setDiscardedVendors(discardedNames.filter(Boolean)); // remove nulls
      } catch (err) {
        console.error("Error fetching vendors or statuses:", err);
      }
    };

    fetchData();
  }, []);

  const handleProceed = () => {
    const vendor = newVendors.find((v) => v.name === selectedVendor);
    if (!vendor) {
      Swal.fire(
        "Invalid Selection",
        "Please choose a valid vendor.",
        "warning"
      );
      return;
    }

    if (discardedVendors.includes(vendor.name.toLowerCase())) {
      Swal.fire(
        "Vendor Discarded",
        "❌ This vendor was disqualified previously.",
        "error"
      );
      return;
    }

    if (evaluatedVendors.includes(vendor.id)) {
      Swal.fire(
        "Already Evaluated",
        "✅ You have already evaluated this vendor.",
        "info"
      );
      return;
    }

    navigate(
      `/prequalificationnew?vendorId=${vendor.id}&vendor=${encodeURIComponent(
        vendor.name
      )}&type=new`
    );
  };

  return (
    <div className="selection-wrapper">
      <h2>Select a New Vendor to Evaluate</h2>

      <select
        value={selectedVendor}
        onChange={(e) => setSelectedVendor(e.target.value)}
      >
        <option value="">-- Choose Vendor --</option>
        {newVendors.map((v) => {
          const isEvaluated = evaluatedVendors.includes(v.id);
          const isDiscarded = discardedVendors.includes(v.name.toLowerCase());
          return (
            <option
              key={v.id}
              value={v.name}
              disabled={isEvaluated || isDiscarded}
            >
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
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default NewVendorSelection;
