import React, { useEffect, useState } from "react";
import "../cssFiles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function Dashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [evaluationMessage, setEvaluationMessage] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.type === "admin");
        }
      }
    };
    checkAdmin();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const handleEvaluateClick = async () => {
    try {
      const settingsRef = doc(db, "evaluationSettings", "period");
      const snapshot = await getDoc(settingsRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const now = new Date();
        const start = data.evaluationstart?.toDate();
        const end = data.evaluationend?.toDate();

        if (!start || !end) {
          setEvaluationMessage(
            "⚠️ Evaluation period is not configured properly."
          );
          return;
        }

        if (now < start) {
          setEvaluationMessage("⏳ Evaluation has not started yet.");
        } else if (now > end) {
          setEvaluationMessage("❌ Evaluation period has ended.");
        } else {
          navigate("/evaluate");
        }
      } else {
        setEvaluationMessage("⚠️ Evaluation settings not found.");
      }
    } catch (err) {
      console.error("Error checking evaluation window:", err);
      setEvaluationMessage("❌ Error checking evaluation period.");
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="left-header"></div>

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <img
              src="/images/iscore-logo.png"
              alt="Iscore Logo"
              className="dashboard-logo"
            />

            <div className="header-actions">
              <div
                className="profile-section"
                onClick={() => navigate("/profile")}
              >
                <span className="profile-icon">👤</span>
                <span className="profile-text">Profile</span>
              </div>

              <button className="signout-button" onClick={handleSignOut}>
                🔓 Sign Out
              </button>
            </div>
          </div>

          {/* Evaluation Tools */}
          <div className="section-title">📋 Evaluation Tools</div>
          <div className="dashboard-buttons">
            <div className="dashboard-card-purple" onClick={handleEvaluateClick}>
              <span className="card-icon">✏</span>
              <span className="card-text">Evaluate Vendors</span>
            </div>

            {evaluationMessage && (
              <p
                style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}
              >
                {evaluationMessage}
              </p>
            )}

            <div
              className="dashboard-card-purple"
              onClick={() => navigate("/ScorePage")}
            >
              <span className="card-icon">📊</span>
              <span className="card-text">Check Vendors Score</span>
            </div>
          </div>

          {/* Admin Tools (Only visible to admins) */}
          {isAdmin && (
            <>
              <div className="section-title">🛠️ Administration Tools</div>
              <div className="dashboard-buttons">
                <div
                  className="dashboard-card"
                  onClick={() => navigate("/evaluation-settings")}
                >
                  <span className="card-icon">⚙️</span>
                  <span className="card-text">Manage Evaluation Period</span>
                </div>

                <div
                  className="dashboard-card"
                  onClick={() => navigate("/AccessControl")}
                >
                  <span className="card-icon">🧑‍💼</span>
                  <span className="card-text">Manage User Access</span>
                </div>

                <div
                  className="dashboard-card"
                  onClick={() => navigate("/new-vendor-entry")}
                >
                  <span className="card-icon">➕</span>
                  <span className="card-text">Add New Vendor</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
