import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import "../cssFiles/EvaluationSettings.css"; // optional styling

function EvaluationSettings() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDates = async () => {
      const configRef = doc(db, "evaluationSettings", "period");
      const snapshot = await getDoc(configRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const start = data.evaluationstart?.toDate().toISOString().slice(0, 10);
        const end = data.evaluationend?.toDate().toISOString().slice(0, 10);
        setStartDate(start || "");
        setEndDate(end || "");
      }
      setLoading(false);
    };
    fetchDates();
  }, []);

  const handleSave = async () => {
    if (!startDate || !endDate) {
      setMessage("❌ Both dates are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setMessage("❌ Start date must be before end date.");
      return;
    }

    try {
      await setDoc(doc(db, "evaluationSettings", "period"), {
        evaluationstart: Timestamp.fromDate(start),
        evaluationend: Timestamp.fromDate(end),
        allowedusers: [] // Optional: initialize if needed
      });
      setMessage("✅ Dates saved successfully.");
    } catch (err) {
      console.error("Error saving dates:", err);
      setMessage("❌ Failed to save dates.");
    }
  };

  const goBack = () => navigate("/dashboard");

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="eval-settings-wrapper">
      <div className="settings-header">
        <h2>🛠️ Admin Evaluation Period Settings</h2>
        <button onClick={goBack} className="back-btn">← Back to Dashboard</button>
      </div>

      <div className="settings-form">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={handleSave}>Save Dates</button>
        {message && <p className="status-msg">{message}</p>}
      </div>
    </div>
  );
}

export default EvaluationSettings;
