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

const MAX_SCORES = {
  finance: 30,
  both: 25,
  IT: 35,
};

function VendorsDashboard() {
  const [evaluations, setEvaluations] = useState([]);
  const [vendorStats, setVendorStats] = useState([]);
  const [vendorSeries, setVendorSeries] = useState([]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      const snapshot = await getDocs(collection(db, "evaluations"));
      const allEvals = snapshot.docs.map((doc) => {
        const data = doc.data();
        const { totalScores = {} } = data;

        return {
          vendorName: data.vendorName,
          evaluator: data.evaluatorName || "Unknown",
          createdAt: data.submittedAt?.toDate().toISOString().split("T")[0],
          departmentScores: {
            both: totalScores.both ?? 0,
            finance: totalScores.finance ?? 0,
            IT: totalScores.IT ?? 0,
          },
        };
      });

      setEvaluations(allEvals);

      // Vendor-wise aggregation
      const vendorMap = {};
      allEvals.forEach((e) => {
        const vendor = e.vendorName;
        if (!vendorMap[vendor]) {
          vendorMap[vendor] = {
            financeTotal: 0,
            financeCount: 0,
            bothTotal: 0,
            bothCount: 0,
            itTotal: 0,
            itCount: 0,
          };
        }

        const { finance, both, IT } = e.departmentScores;

        if (finance > 0) {
          vendorMap[vendor].financeTotal += (finance / MAX_SCORES.finance) * 100;
          vendorMap[vendor].financeCount += 1;
        }
        if (both > 0) {
          vendorMap[vendor].bothTotal += (both / MAX_SCORES.both) * 100;
          vendorMap[vendor].bothCount += 1;
        }
        if (IT > 0) {
          vendorMap[vendor].itTotal += (IT / MAX_SCORES.IT) * 100;
          vendorMap[vendor].itCount += 1;
        }
      });

      const scoreData = Object.entries(vendorMap).map(([vendorName, stats]) => ({
        vendorName,
        financeAvg:
          stats.financeCount > 0
            ? parseFloat((stats.financeTotal / stats.financeCount).toFixed(2))
            : 0,
        bothAvg:
          stats.bothCount > 0
            ? parseFloat((stats.bothTotal / stats.bothCount).toFixed(2))
            : 0,
        itAvg:
          stats.itCount > 0
            ? parseFloat((stats.itTotal / stats.itCount).toFixed(2))
            : 0,
        evaluations:
          stats.financeCount + stats.bothCount + stats.itCount,
      }));

      setVendorStats(scoreData);

      // Grouped time-series data for line chart (totalScore trends)
      const dateVendorMap = {};
      allEvals.forEach(({ vendorName, createdAt, departmentScores }) => {
        const { finance, both, IT } = departmentScores;
        const totalScore =
          (finance / MAX_SCORES.finance || 0) * 100 +
          (both / MAX_SCORES.both || 0) * 100 +
          (IT / MAX_SCORES.IT || 0) * 100;

        const presentDepts = [finance > 0, both > 0, IT > 0].filter(Boolean).length;
        const normalized = presentDepts > 0 ? totalScore / presentDepts : 0;

        if (!dateVendorMap[createdAt]) dateVendorMap[createdAt] = {};
        dateVendorMap[createdAt][vendorName] = parseFloat(normalized.toFixed(2));
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

  const uniqueVendors = [...new Set(evaluations.map((e) => e.vendorName))];

  return (
    <div className="vendors-dashboard-wrapper">
      <h2 className="vendors-dashboard-title">📊 All Vendors Comparative Report</h2>

      {/* Line Chart */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Performance Trend Over Time (Total Normalized %)</h3>
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

      {/* Grouped Bar Chart */}
      <div style={{ width: "100%", height: 350, marginBottom: "2rem" }}>
        <h3>Department-Wise Average Scores (Normalized %)</h3>
        {vendorStats.length > 0 ? (
          <ResponsiveContainer>
            <BarChart
              data={vendorStats}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendorName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="financeAvg" fill="#82ca9d" name="Finance" />
              <Bar dataKey="bothAvg" fill="#8884d8" name="Both" />
              <Bar dataKey="itAvg" fill="#ff6f61" name="IT" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No department data available.
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
              <th>Finance Avg (%)</th>
              <th>Both Avg (%)</th>
              <th>IT Avg (%)</th>
              <th>Evaluations Count</th>
            </tr>
          </thead>
          <tbody>
            {vendorStats.map((vendor, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{vendor.vendorName}</td>
                <td>{vendor.financeAvg}</td>
                <td>{vendor.bothAvg}</td>
                <td>{vendor.itAvg}</td>
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
