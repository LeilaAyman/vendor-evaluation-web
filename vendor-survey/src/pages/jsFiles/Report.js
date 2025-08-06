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

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function Report() {
  const [evaluations, setEvaluations] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [deptBarData, setDeptBarData] = useState([]);
  const [lowestDepts, setLowestDepts] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const query = useQuery();
  const vendorName = query.get("vendor");

  useEffect(() => {
    const fetchEvaluations = async () => {
      const snapshot = await getDocs(collection(db, "evaluations"));

      const parsedEvals = snapshot.docs.map((doc) => {
        const data = doc.data();
        const { totalScores = {} } = data;
        const date = data.submittedAt?.toDate();

        const norm = (value, max) =>
          value ? ((value / max) * 100).toFixed(2) : "0.00";

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
          totalScore:
            (totalScores.both ?? 0) +
            (totalScores.finance ?? 0) +
            (totalScores.IT ?? 0),
        };
      });

      const vendorEvals = parsedEvals.filter(
        (e) =>
          e.vendorName?.toLowerCase().trim() ===
          vendorName?.toLowerCase().trim()
      );

      setEvaluations(vendorEvals);

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

      // Per-department average
      const deptAverages = Object.keys(MAX_SCORES).map((dept) => {
        const average =
          counts[dept] > 0 ? totals[dept] / counts[dept] : 0;
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

      // Overall average
      const activeScores = deptAverages
        .map((d) => d.avg)
        .filter((v) => v > 0);
      const overallAvg =
        activeScores.length > 0
          ? (activeScores.reduce((a, b) => a + b, 0) / activeScores.length).toFixed(2)
          : null;
      setAvgScore(overallAvg);

      // Find lowest scoring departments (below 60%)
      const low = deptAverages.filter((d) => d.avg > 0 && d.avg < 60);
      setLowestDepts(low);

      // === Quarterly Average Chart ===
      const quarterStats = {};
      vendorEvals.forEach((e) => {
        const date = new Date(e.createdAt);
        const quarter = ["Q1", "Q2", "Q3", "Q4"][
          Math.floor(date.getMonth() / 3)
        ];

        if (!quarterStats[quarter]) {
          quarterStats[quarter] = { sum: 0, count: 0 };
        }
        quarterStats[quarter].sum += e.totalScore;
        quarterStats[quarter].count += 1;
      });

      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      const quarterAvgData = quarters.map((q) => ({
        quarter: q,
        avgScore: quarterStats[q]
          ? parseFloat(
              (quarterStats[q].sum / quarterStats[q].count).toFixed(2)
            )
          : 0,
      }));

      setQuarterlyData(quarterAvgData);
    };

    fetchEvaluations();
  }, [vendorName]);

  return (
    <div className="report-container">
      <h2 className="report-title">Report for: {vendorName}</h2>

      {/* Quarterly Evaluation Scores */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Average Evaluation Score by Quarter</h3>
        <ResponsiveContainer>
          <BarChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgScore" fill="#0088FE" name="Avg Score">
              <LabelList dataKey="avgScore" position="top" formatter={(v) => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Overall Average Bar */}
      <div style={{ width: "100%", height: 200, marginBottom: "2rem" }}>
        <h3>Overall Average Score</h3>
        {avgScore ? (
          <ResponsiveContainer>
            <BarChart
              data={[{ vendorName: vendorName, avgScore: parseFloat(avgScore) }]}
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
                label={{ position: "top", formatter: (val) => `${val}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No average score available.
          </p>
        )}
      </div>

      {/* Department Breakdown */}
      <div style={{ width: "100%", height: 250, marginBottom: "2rem" }}>
        <h3>Department-Wise Average Scores</h3>
        <ResponsiveContainer>
          <BarChart data={deptBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg" fill="#4F3795" name="Avg %" barSize={50}>
              <LabelList dataKey="avg" position="top" formatter={(v) => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Weakness Analysis */}
      {lowestDepts.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Department-Level Weaknesses</h3>
          <p>
            Despite an acceptable overall score, the following departments had
            notably low average scores (below 60%):
          </p>
          <ul>
            {lowestDepts.map((d, i) => (
              <li key={i}>
                <strong>{d.department.toUpperCase()}:</strong> {d.avg}% — Needs improvement
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
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
                  {item.departmentScores.both} / {MAX_SCORES.both} (
                  {item.departmentScores.normalized.both}%)
                </td>
                <td>
                  {item.departmentScores.finance} / {MAX_SCORES.finance} (
                  {item.departmentScores.normalized.finance}%)
                </td>
                <td>
                  {item.departmentScores.IT} / {MAX_SCORES.IT} (
                  {item.departmentScores.normalized.IT}%)
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
