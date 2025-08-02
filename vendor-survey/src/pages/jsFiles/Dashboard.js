import React from "react";
import "../cssFiles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

function Dashboard() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  return (
    <div className="register-page-wrapper">
      <div className="left-header">
        <div className="back-button" onClick={handleSignOut}>
          ← Sign Out
        </div>
      </div>

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <img
              src="/images/iscore-logo.png"
              alt="Iscore Logo"
              className="dashboard-logo"
            />
            <div className="profile-section">
              <span className="profile-icon">👤</span>
              <span className="profile-text">Profile</span>
            </div>
          </div>

          <div className="dashboard-buttons">
            <div
              className="dashboard-card"
              onClick={() => navigate("/evaluate")}
            >
              <span className="card-icon">✏</span>
              <span className="card-text">Evaluate Vendor</span>
            </div>

            <div
              className="dashboard-card"
              onClick={() => navigate("/ScorePage")} // ✅ Updated route
            >
              <span className="card-icon">📊</span>
              <span className="card-text">Check Vendor Score</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
