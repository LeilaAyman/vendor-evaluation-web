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
import "../cssFiles/VendorsDashboard.css";

function VendorsDashboard() {
  const [evaluations, setEvaluations] = useState([]);
  const [avgScores, setAvgScores] = useState([]);
  const [vendorSeries, setVendorSeries] = useState([]);

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

      setEvaluations(allEvals);

      const vendorMap = {};
      allEvals.forEach((e) => {
        const vendor = e.vendorName;
        if (!vendorMap[vendor]) {
          vendorMap[vendor] = { total: 0, count: 0 };
        }
        vendorMap[vendor].total += e.totalScore;
        vendorMap[vendor].count += 1;
      });

      const scoreData = Object.entries(vendorMap).map(([vendorName, stats]) => ({
        vendorName,
        avgScore: parseFloat((stats.total / stats.count).toFixed(2)),
        evaluations: stats.count,
      }));

      setAvgScores(scoreData);

      // Create time-series data grouped by date per vendor
      const dateVendorMap = {};
      allEvals.forEach(({ vendorName, createdAt, totalScore }) => {
        if (!dateVendorMap[createdAt]) dateVendorMap[createdAt] = {};
        dateVendorMap[createdAt][vendorName] = totalScore;
      });

      const chartData = Object.entries(dateVendorMap).map(([date, vendors]) => ({
        createdAt: date,
        ...vendors,
      }));

      setVendorSeries(chartData);
    };

    fetchEvaluations();
  }, []);

  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
    "#C9CBCF", "#8DD1E1", "#FFB6B9", "#B6E2D3",
  ];

  const uniqueVendors = [
    ...new Set(evaluations.map((e) => e.vendorName)),
  ];

  return (
    <div className="vendors-dashboard-wrapper">
      <h2 className="vendors-dashboard-title">📊 All Vendors Comparative Report</h2>

      {/* Line Chart */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Performance (All Vendors)</h3>
        {vendorSeries.length > 0 ? (
          <ResponsiveContainer>
            <LineChart
              data={vendorSeries}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {uniqueVendors.map((vendor, idx) => (
                <Line
                  key={vendor}
                  type="monotone"
                  dataKey={vendor}
                  stroke={colors[idx % colors.length]}
                  name={vendor}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No evaluation data available.
          </p>
        )}
      </div>

      {/* Bar Chart */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Average Score Per Vendor</h3>
        {avgScores.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={avgScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendorName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avgScore"
                fill="#3CBFC1"
                name="Average Score"
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No average score data.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="vendors-table-wrapper">
        <table className="vendors-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor Name</th>
              <th>Average Score</th>
              <th>Evaluations Count</th>
            </tr>
          </thead>
          <tbody>
            {avgScores.map((vendor, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{vendor.vendorName}</td>
                <td>{vendor.avgScore}</td>
                <td>{vendor.evaluations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VendorsDashboard;