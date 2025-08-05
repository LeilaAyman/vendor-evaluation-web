import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cssFiles/ScorePage.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const getScoreColor = (score) => {
  if (score < 50) return "#E63946";
  if (score < 70) return "#F4A261";
  if (score < 85) return "#F6C90E";
  return "#2A9D8F";
};

function ScorePage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      const [evaluationsSnap, vendorsSnap] = await Promise.all([
        getDocs(collection(db, "evaluations")),
        getDocs(collection(db, "vendors")),
      ]);

      const evaluations = evaluationsSnap.docs.map((doc) => doc.data());

      // Build a set of vendors that are NOT new
      const nonNewVendorsSet = new Set(
        vendorsSnap.docs
          .map((doc) => doc.data())
          .filter((vendor) => vendor.new !== true)
          .map((vendor) => vendor.name?.trim())
      );

      const vendorMap = {};

      evaluations.forEach((evalItem) => {
        const vendor = evalItem.vendorName?.trim();
        if (!vendor || !nonNewVendorsSet.has(vendor)) return;

        if (!vendorMap[vendor]) {
          vendorMap[vendor] = {
            departmentScores: {
              both: [],
              finance: [],
              IT: [],
            },
          };
        }

        const scores = evalItem.totalScores || {};

        Object.entries(scores).forEach(([dept, score]) => {
          if (
            ["both", "finance", "IT"].includes(dept) &&
            typeof score === "number"
          ) {
            vendorMap[vendor].departmentScores[dept].push(score);
          }
        });
      });

      const vendorList = Object.entries(vendorMap).map(
        ([name, data], index) => {
          const { both, finance, IT } = data.departmentScores;

          const MAX_SCORES = {
            both: 25,
            finance: 30,
            IT: 35,
          };

          const avg = (arr) =>
            arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

          const bothAvg = avg(both);
          const financeAvg = avg(finance);
          const itAvg = avg(IT);

          const bothPct = bothAvg > 0 ? (bothAvg / MAX_SCORES.both) * 100 : 0;
          const financePct =
            financeAvg > 0 ? (financeAvg / MAX_SCORES.finance) * 100 : 0;
          const itPct = itAvg > 0 ? (itAvg / MAX_SCORES.IT) * 100 : 0;

          const percentList = [bothPct, financePct, itPct].filter((p) => p > 0);
          const totalScore =
            percentList.length > 0
              ? Math.round(
                  percentList.reduce((a, b) => a + b, 0) / percentList.length
                )
              : 0;

          return {
            id: (index + 1).toString().padStart(2, "0"),
            name,
            score: totalScore,
          };
        }
      );

      setVendors(vendorList);
    };

    fetchScores();
  }, []);

  return (
    <div className="score-wrapper">
      <div className="score-container">
        <div className="score-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              className="back-arrow"
              onClick={() => navigate("/dashboard")}
            >
              ←
            </button>
            <img
              src="/images/iscore-logo.png"
              alt="Iscore Logo"
              className="score-logo"
            />
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
