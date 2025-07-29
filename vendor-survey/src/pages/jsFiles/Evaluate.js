import React from "react";
import "../cssFiles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import Evaluate from './Evaluate';




function Dashboard() {
  const navigate = useNavigate();
  const auth = getAuth();

   const goBack = () => {
    navigate("/dashboard");
  };
  return (
  <div className="register-page-wrapper">
    <div className="left-header">
      <div className="back-button" onClick={goBack}>
        ← Back
      </div>
    </div>

    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <img src="/images/iscore-logo.png" alt="Iscore Logo" className="dashboard-logo" />

          <div className="profile-section">
            <span className="profile-icon">👤</span>
            <span className="profile-text">Profile</span>
          </div>
        </div>

        <div className="dashboard-buttons">
          <div className="dashboard-card" onClick={() => navigate("/evaluation_intro")}>
            <span className="card-icon">✏️</span>
            <span className="card-text">Quarterly Vendor Evaluation</span>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/score")}>
            <span className="card-icon">📊</span>
            <span className="card-text">New Vendor Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default Dashboard;
