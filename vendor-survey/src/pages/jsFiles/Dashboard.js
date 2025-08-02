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
          setEvaluationMessage("⚠️ Evaluation period is not configured properly.");
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
            <div className="profile-section" onClick={() => navigate("/profile")}>
              <span className="profile-icon">👤</span>
              <span className="profile-text">Profile</span>
            </div>
          </div>

          <div className="dashboard-buttons">
            <div className="dashboard-card" onClick={handleEvaluateClick}>
              <span className="card-icon">✏</span>
              <span className="card-text">Evaluate Vendor</span>
            </div>

            {evaluationMessage && (
              <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
                {evaluationMessage}
              </p>
            )}

            <div className="dashboard-card" onClick={() => navigate("/ScorePage")}>
              <span className="card-icon">📊</span>
              <span className="card-text">Check Vendor Score</span>
            </div>

            {isAdmin && (
              <div className="dashboard-card" onClick={() => navigate("/evaluation-settings")}>
                <span className="card-icon">⚙️</span>
                <span className="card-text">Manage Evaluation Period</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
