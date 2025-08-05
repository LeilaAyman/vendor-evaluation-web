import React, { useEffect, useState } from "react";
import "../cssFiles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function Dashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [evaluationEnded, setEvaluationEnded] = useState(false);

  useEffect(() => {
    const checkEvaluationPeriod = async () => {
      try {
        const settingsRef = doc(db, "evaluationSettings", "period");
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const { endDate } = settingsSnap.data();
          if (endDate) {
            const now = new Date();
            const end = new Date(endDate);
            if (now > end) {
              setEvaluationEnded(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking evaluation period:", error);
      }
    };

    checkEvaluationPeriod();
  }, []);

  const goBack = () => {
    navigate("/dashboard");
  };

  const handleEvaluationClick = (path) => {
    if (evaluationEnded) {
      alert("⚠️ Sorry, the evaluation period has ended.");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="left-header">

      </div>

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <button className="back-button" onClick={goBack}>🔙 Back </button>

          <div className="dashboard-header">
            <img src="/images/iscore-logo.png" alt="Iscore Logo" className="dashboard-logo" />
            <div className="profile-section" onClick={() => navigate("/profile")}>
              <span className="profile-icon">👤</span>
              <span className="profile-text">Profile</span>

            </div>

          </div>

          <div className="dashboard-buttons">
            <div className="dashboard-card" onClick={() => handleEvaluationClick("/evaluation_intro")}>
              <span className="card-icon">✏</span>
              <span className="card-text">Existing Vendor Evaluation</span>
            </div>

            <div className="dashboard-card" onClick={() => navigate("/new-vendor-evaluation")}>
              <span className="card-icon">🆕</span>
              <span className="card-text">New Vendor Evaluation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
