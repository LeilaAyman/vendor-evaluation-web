import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/Report.css";
import { useLocation } from "react-router-dom";

// Helper to get query param
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function Report() {
  const [evaluations, setEvaluations] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const query = useQuery();
  const vendorName = query.get("vendor");

  useEffect(() => {
    const fetchEvaluations = async () => {
      const snapshot = await getDocs(collection(db, "evaluations"));
      const allEvals = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          vendorName: data.vendorName,
          evaluator: data.evaluatorName || "Unknown",
          totalScore: data.totalScore,
          createdAt: data.submittedAt?.toDate().toISOString().split("T")[0],
        };
      });

      // Filter evaluations for the selected vendor (case-insensitive + trim)
      const vendorEvals = allEvals.filter(
        (e) =>
          e.vendorName?.toLowerCase().trim() ===
          vendorName?.toLowerCase().trim()
      );

      setEvaluations(vendorEvals);

      // Calculate average score
      if (vendorEvals.length > 0) {
        const total = vendorEvals.reduce((sum, e) => sum + e.totalScore, 0);
        const avg = total / vendorEvals.length;
        setAvgScore(avg.toFixed(2));
      }
    };

    fetchEvaluations();
  }, [vendorName]);

  return (
    <div className="report-container">
      <h2 className="report-title">Report for: {vendorName}</h2>

      {/* Line Chart */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Performance Over Time</h3>
        {evaluations.length > 0 ? (
          <ResponsiveContainer>
            <LineChart
              data={evaluations}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalScore"
                stroke="#8884d8"
                name="Total Score"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No evaluation data available.
          </p>
        )}
      </div>

      {/* Bar Chart */}
      <div style={{ width: "100%", height: 200, marginBottom: "2rem" }}>
        <h3>Average Evaluation Score</h3>
        {avgScore ? (
          <ResponsiveContainer>
            <BarChart
              data={[
                {
                  vendorName: vendorName,
                  avgScore: parseFloat(avgScore),
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendorName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avgScore"
                fill="#82ca9d"
                name="Average Score"
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No average score available.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Evaluator</th>
              <th>Total Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((item, index) => (
              <tr key={index}>
                <td>{item.evaluator}</td>
                <td>{item.totalScore}</td>
                <td>{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Report;
