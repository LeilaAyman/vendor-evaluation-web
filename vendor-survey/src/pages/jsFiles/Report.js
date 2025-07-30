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
import "../cssFiles/Report.css";

function Report() {
  const [evaluations, setEvaluations] = useState([]);

  // Dummy data to simulate evaluations
  useEffect(() => {
    const dummyData = [
      
      {
        vendorName: "Vendor A",
        evaluator: "Bob",
        totalScore: 75,
        createdAt: "2024-03-31",
        remarks: "Delivery delayed",
      },
      {
        vendorName: "Vendor A",
        evaluator: "john",
        totalScore: 75,
        createdAt: "2024-06-30",
        remarks: "Delivery delayed",
      },
      {
        vendorName: "Vendor B",
        evaluator: "Charlie",
        totalScore: 92,
        createdAt: "2024-09-30",
        remarks: "Excellent",
      },
      {
        vendorName: "Vendor B",
        evaluator: "Alice",
        totalScore: 88,
        createdAt: "2024-12-31",
        remarks: "Consistent quality",
      },
    ];
    setEvaluations(dummyData);
  }, []);

  return (
    <div className="report-container">
      <h2 className="report-title">Vendor Evaluation Report</h2>

      {/* Line Chart Section */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Vendor Performance Over Time</h3>
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
      </div>

      {/* Bar Chart Section */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Average Score Per Vendor</h3>
        <ResponsiveContainer>
          <BarChart
            data={Object.values(
              evaluations.reduce((acc, curr) => {
                if (!acc[curr.vendorName]) {
                  acc[curr.vendorName] = {
                    vendorName: curr.vendorName,
                    totalScore: 0,
                    count: 0,
                  };
                }
                acc[curr.vendorName].totalScore += curr.totalScore;
                acc[curr.vendorName].count += 1;
                return acc;
              }, {})
            ).map((vendor) => ({
              vendorName: vendor.vendorName,
              avgScore: vendor.totalScore / vendor.count,
            }))}
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
              barSize={40} // Added this line
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table Section */}
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Evaluator</th>
              <th>Total Score</th>
              <th>Date</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((item, index) => (
              <tr key={index}>
                <td>{item.vendorName}</td>
                <td>{item.evaluator}</td>
                <td>{item.totalScore}</td>
                <td>{item.createdAt}</td>
                <td>{item.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Report;
