import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/Report.css";
import { useLocation } from "react-router-dom";

const MAX_SCORES = {
  finance: 30,
  both: 25,
  IT: 35,
};

const useQuery = () => new URLSearchParams(useLocation().search);

function Report() {
  const [evaluations, setEvaluations] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [deptBarData, setDeptBarData] = useState([]);
  const [lowestDepts, setLowestDepts] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [insights, setInsights] = useState({
    totalEvals: 0,
    bestDept: null,
    weakestDept: null,
    summary: "",
  });

  const query = useQuery();
  const vendorName = query.get("vendor");

  useEffect(() => {
    const fetchEvaluations = async () => {
      const snapshot = await getDocs(collection(db, "evaluations"));

      const norm = (value, max) =>
        value ? ((value / max) * 100).toFixed(2) : "0.00";

      const parsedEvals = snapshot.docs.map((doc) => {
        const data = doc.data();
        const { totalScores = {} } = data;
        const date = data.submittedAt?.toDate();

        return {
          vendorName: data.vendorName,
          evaluator: data.evaluatorName || "Unknown",
          createdAt: date ? date.toISOString().split("T")[0] : "Unknown",
          departmentScores: {
            both: totalScores.both ?? 0,
            finance: totalScores.finance ?? 0,
            IT: totalScores.IT ?? 0,
            normalized: {
              both: norm(totalScores.both, MAX_SCORES.both),
              finance: norm(totalScores.finance, MAX_SCORES.finance),
              IT: norm(totalScores.IT, MAX_SCORES.IT),
            },
          },
        };
      });

      const vendorEvals = parsedEvals.filter(
        (e) =>
          e.vendorName?.toLowerCase().trim() ===
          vendorName?.toLowerCase().trim()
      );

      setEvaluations(vendorEvals);

      // === Department Average Chart ===
      const totals = { both: 0, finance: 0, IT: 0 };
      const counts = { both: 0, finance: 0, IT: 0 };

      vendorEvals.forEach((e) => {
        for (const dept of Object.keys(MAX_SCORES)) {
          const score = e.departmentScores[dept];
          if (score > 0) {
            totals[dept] += (score / MAX_SCORES[dept]) * 100;
            counts[dept]++;
          }
        }
      });

      const deptAverages = Object.keys(MAX_SCORES).map((dept) => {
        const average = counts[dept] > 0 ? totals[dept] / counts[dept] : 0;
        return {
          department: dept,
          avg: parseFloat(average.toFixed(2)),
        };
      });

      setDeptBarData(
        deptAverages.map((d) => ({
          department: d.department.charAt(0).toUpperCase() + d.department.slice(1),
          avg: d.avg,
        }))
      );

      // === Overall Normalized Average ===
      const normalizedEvalAverages = vendorEvals.map((e) => {
        const scores = Object.keys(MAX_SCORES)
          .map((dept) => parseFloat(e.departmentScores.normalized[dept]))
          .filter((val) => val > 0);
        return scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      });

      const overallNormalizedAvg =
        normalizedEvalAverages.length > 0
          ? (
              normalizedEvalAverages.reduce((a, b) => a + b, 0) /
              normalizedEvalAverages.length
            ).toFixed(2)
          : null;

      setAvgScore(overallNormalizedAvg);

      const low = deptAverages.filter((d) => d.avg > 0 && d.avg < 60);
      setLowestDepts(low);

      const bestDept = deptAverages.reduce(
        (max, dept) => (dept.avg > max.avg ? dept : max),
        { department: "", avg: 0 }
      );

      const weakestDept = deptAverages.reduce(
        (min, dept) =>
          dept.avg > 0 && (dept.avg < min.avg || min.avg === 0) ? dept : min,
        { department: "", avg: 100 }
      );

      let summary = "";
      const overall = parseFloat(overallNormalizedAvg);
      if (overall >= 85) summary = "Excellent overall performance.";
      else if (overall >= 70) summary = "Satisfactory performance with room to grow.";
      else if (overall >= 50) summary = "Needs improvement.";
      else summary = "Poor performance. Take corrective actions.";

      setInsights({
        totalEvals: vendorEvals.length,
        bestDept,
        weakestDept,
        summary,
      });

      // === Quarterly Normalized Evaluation Averages ===
      const quarterStats = {};

      vendorEvals.forEach((e) => {
        const date = new Date(e.createdAt);
        const quarter = ["Q1", "Q2", "Q3", "Q4"][Math.floor(date.getMonth() / 3)];

        const normalizedScores = Object.keys(MAX_SCORES)
          .map((dept) => parseFloat(e.departmentScores.normalized[dept]))
          .filter((val) => val > 0);

        const normalizedAvg =
          normalizedScores.length > 0
            ? normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length
            : 0;

        if (!quarterStats[quarter]) {
          quarterStats[quarter] = { sum: 0, count: 0 };
        }

        quarterStats[quarter].sum += normalizedAvg;
        quarterStats[quarter].count += 1;
      });

      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      const quarterAvgData = quarters.map((q) => ({
        quarter: q,
        avgScore: quarterStats[q]
          ? parseFloat((quarterStats[q].sum / quarterStats[q].count).toFixed(2))
          : 0,
      }));

      setQuarterlyData(quarterAvgData);
    };

    fetchEvaluations();
  }, [vendorName]);

  return (
    <div className="report-container">
      <h2 className="report-title">Report for: {vendorName}</h2>

      <div className="insights-box">
        <h3 style={{ color: "#4F3795", marginBottom: "10px" }}>Vendor Insights</h3>
        <ul>
          <li><strong>Total Evaluations:</strong> {insights.totalEvals}</li>
          <li><strong>Best Department:</strong> {insights.bestDept?.department?.toUpperCase()} ({insights.bestDept?.avg}%)</li>
          <li><strong>Weakest Department:</strong> {insights.weakestDept?.department?.toUpperCase()} ({insights.weakestDept?.avg}%)</li>
          <li><strong>Overall Summary:</strong> {insights.summary}</li>
        </ul>
      </div>

      <div style={{ width: "100%", height: 200, marginBottom: "2rem" }}>
        <h3>Average Evaluation Score by Quarter</h3>
        <ResponsiveContainer>
          <BarChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgScore" fill="#0088FE" name="Avg Score" barSize={20}>
              <LabelList
                dataKey="avgScore"
                position="top"
                formatter={(v) => `${v}%`}
                style={{ fill: "#000", fontWeight: "bold" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 180, marginBottom: "2rem" }}>
        <h3>Overall Average Score</h3>
        {avgScore ? (
          <ResponsiveContainer>
            <BarChart data={[{ vendorName, avgScore: parseFloat(avgScore) }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendorName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgScore" fill="#82ca9d" name="Average Score" barSize={20}>
                <LabelList
                  dataKey="avgScore"
                  position="top"
                  formatter={(v) => `${v}%`}
                  style={{ fill: "#000", fontWeight: "bold" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>No average score available.</p>
        )}
      </div>

      <div style={{ width: "100%", height: 200, marginBottom: "2rem" }}>
        <h3>Department-Wise Average Scores</h3>
        <ResponsiveContainer>
          <BarChart data={deptBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg" fill="#4F3795" name="Avg %" barSize={20}>
              <LabelList
                dataKey="avg"
                position="top"
                formatter={(v) => `${v}%`}
                style={{ fill: "#000", fontWeight: "bold" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {lowestDepts.length > 0 && (
        <div>
          <h3>Department-Level Weaknesses</h3>
          <p>Departments with average scores below 60%:</p>
          <ul>
            {lowestDepts.map((d, i) => (
              <li key={i}>
                <strong>{d.department.toUpperCase()}:</strong> {d.avg}% — Needs improvement
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Evaluator</th>
              <th>Both</th>
              <th>Finance</th>
              <th>IT</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((item, index) => (
              <tr key={index}>
                <td>{item.evaluator}</td>
                <td>
                  {item.departmentScores.both > 0
                    ? `${item.departmentScores.both} / ${MAX_SCORES.both} (${item.departmentScores.normalized.both}%)`
                    : "Not their department"}
                </td>
                <td>
                  {item.departmentScores.finance > 0
                    ? `${item.departmentScores.finance} / ${MAX_SCORES.finance} (${item.departmentScores.normalized.finance}%)`
                    : "Not their department"}
                </td>
                <td>
                  {item.departmentScores.IT > 0
                    ? `${item.departmentScores.IT} / ${MAX_SCORES.IT} (${item.departmentScores.normalized.IT}%)`
                    : "Not their department"}
                </td>
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
