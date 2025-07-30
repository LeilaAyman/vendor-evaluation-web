import React from "react";
import { useNavigate } from "react-router-dom";
import "../cssFiles/ScorePage.css";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Function to get color based on score
const getScoreColor = (score) => {
  if (score < 50) return "#E63946"; // red
  if (score < 70) return "#F4A261"; // orange
  if (score < 85) return "#F6C90E"; // yellow
  return "#2A9D8F"; // green
};

const dummyVendors = [
  { id: "01", name: "Home Decor Range", score: 45 },
  { id: "02", name: "Disney Princess Pink Bag 18'", score: 72 },
  { id: "03", name: "Bathroom Essentials", score: 65 },
  { id: "04", name: "Apple Smartwatches", score: 88 },
];

function ScorePage() {
  const navigate = useNavigate();

  return (
    <div className="score-wrapper">
      <div className="score-container">
        <div className="score-header">
          <button className="back-arrow" onClick={() => navigate("/dashboard")}>←</button>
          <img src="/images/iscore-logo.png" alt="Iscore Logo" className="score-logo" />
        </div>

        <table className="score-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor Name</th>
              <th>Score</th>
              <th>Extract credit report</th>
            </tr>
          </thead>
          <tbody>
            {dummyVendors.map((vendor, index) => {
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
