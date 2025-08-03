import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cssFiles/ScorePage.css";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

// Function to get color based on score
const getScoreColor = (score) => {
  if (score < 50) return "#E63946"; // red
  if (score < 70) return "#F4A261"; // orange
  if (score < 85) return "#F6C90E"; // yellow
  return "#2A9D8F"; // green
};

function ScorePage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      const snapshot = await getDocs(collection(db, "evaluations"));
      const evaluations = snapshot.docs.map((doc) => doc.data());

      const vendorMap = {};

      evaluations.forEach((evalItem) => {
        const vendor = evalItem.vendorName;
        if (!vendorMap[vendor]) {
          vendorMap[vendor] = { total: 0, count: 0 };
        }
        vendorMap[vendor].total += evalItem.totalScore;
        vendorMap[vendor].count += 1;
      });

      const vendorList = Object.entries(vendorMap).map(([name, stats], index) => ({
        id: (index + 1).toString().padStart(2, "0"),
        name,
        score: Math.round(stats.total / stats.count),
      }));

      setVendors(vendorList);
    };

    fetchScores();
  }, []);

  return (
    <div className="score-wrapper">
      <div className="score-container">
        <div className="score-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="back-arrow" onClick={() => navigate("/dashboard")}>←</button>
            <img src="/images/iscore-logo.png" alt="Iscore Logo" className="score-logo" />
          </div>
          <button
            className="dashboard-btn"
            onClick={() => navigate("/vendors-dashboard")}
          >
            View Full Vendors Dashboard
          </button>
        </div>

        <table className="score-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor Name</th>
              <th>Score</th>
              <th>Extract Credit Report</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => {
              const color = getScoreColor(vendor.score);
              return (
                <tr key={index}>
                  <td>{vendor.id}</td>
                  <td>{vendor.name}</td>
                  <td>
                    <div style={{ width: 70, height: 70 }}>
                      <CircularProgressbar
                        value={vendor.score}
                        text={`${vendor.score}%`}
                        strokeWidth={10}
                        styles={buildStyles({
                          pathColor: color,
                          textColor: "#333",
                          trailColor: "#eee",
                        })}
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      className="report-btn"
                      style={{ borderColor: color, color: color }}
                      onClick={() => navigate(`/report?vendor=${vendor.name}`)}
                    >
                      View Full Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScorePage;
