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

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function Report() {
  const [evaluations, setEvaluations] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [evaluationCountPerQuarter, setEvaluationCountPerQuarter] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [sectionAnalysis, setSectionAnalysis] = useState([]);
  const query = useQuery();
  const vendorName = query.get("vendor");

  useEffect(() => {
    const fetchEvaluations = async () => {
      const snapshot = await getDocs(collection(db, "evaluations"));

      const norm = (value, max) =>
        value ? ((value / max) * 100).toFixed(2) : "0.00";

      const parsedEvals = snapshot.docs.map((doc) => {
        const data = doc.data();
        const dateObj = data.submittedAt?.toDate();
        const month = dateObj?.getMonth();
        const quarter =
          month <= 2 ? "Q1" : month <= 5 ? "Q2" : month <= 8 ? "Q3" : "Q4";

        return {
          vendorName: data.vendorName,
          evaluator: data.evaluatorName || "Unknown",
          totalScore: data.totalScore,
          scores: data.scores || {}, // expected: { pricing: 6, quality: 2, ... }
          quarter,
          createdAt: dateObj?.toISOString().split("T")[0],
        };
      });

      const vendorEvals = allEvals.filter(
        (e) =>
          e.vendorName?.toLowerCase().trim() ===
          vendorName?.toLowerCase().trim()
      );

      setEvaluations(vendorEvals);

      if (vendorEvals.length > 0) {
        // === Overall Analytics ===
        const total = vendorEvals.reduce((sum, e) => sum + e.totalScore, 0);
        const avg = total / vendorEvals.length;
        setAvgScore(avg.toFixed(2));

        const scores = vendorEvals.map((e) => e.totalScore);
        const max = Math.max(...scores);
        const min = Math.min(...scores);

        const countByEvaluator = {};
        vendorEvals.forEach((e) => {
          countByEvaluator[e.evaluator] =
            (countByEvaluator[e.evaluator] || 0) + 1;
        });
        const mostActive = Object.entries(countByEvaluator).sort(
          (a, b) => b[1] - a[1]
        )[0];

        setAnalytics({
          count: vendorEvals.length,
          bestScore: max,
          worstScore: min,
          topEvaluator: mostActive ? mostActive[0] : "N/A",
        });

        // === Section Weakness Analysis ===
        const sectionTotals = {};
        const sectionCounts = {};

        vendorEvals.forEach((evalItem) => {
          const sectionScores = evalItem.scores;
          if (!sectionScores) return;

          for (const [section, score] of Object.entries(sectionScores)) {
            if (!sectionTotals[section]) {
              sectionTotals[section] = 0;
              sectionCounts[section] = 0;
            }
            sectionTotals[section] += score;
            sectionCounts[section] += 1;
          }
        });

        const sectionAvg = Object.entries(sectionTotals).map(([section, total]) => {
          const avg = total / sectionCounts[section];
          return {
            section,
            average: parseFloat(avg.toFixed(2)),
          };
        });

        const lowScoringSections = sectionAvg.filter((s) => s.average < 5);
        setSectionAnalysis(lowScoringSections);

        // === Charts: Average by Quarter ===
        const quarterMap = {};
        const quarterCountMap = {};
        vendorEvals.forEach((e) => {
          if (!quarterMap[e.quarter]) {
            quarterMap[e.quarter] = { total: 0, count: 0 };
            quarterCountMap[e.quarter] = 0;
          }
          quarterMap[e.quarter].total += e.totalScore;
          quarterMap[e.quarter].count += 1;
          quarterCountMap[e.quarter] += 1;
        });

        const quarterData = ["Q1", "Q2", "Q3", "Q4"].map((q) => ({
          quarter: q,
          avgScore: quarterMap[q]
            ? parseFloat((quarterMap[q].total / quarterMap[q].count).toFixed(2))
            : 0,
        }));
        setQuarterlyData(quarterData);

        const quarterCountData = ["Q1", "Q2", "Q3", "Q4"].map((q) => ({
          quarter: q,
          count: quarterCountMap[q] || 0,
        }));
        setEvaluationCountPerQuarter(quarterCountData);
      }
    };

    fetchEvaluations();
  }, [vendorName]);

  return (
    <div className="report-container">
      <h2 className="report-title">Report for: {vendorName}</h2>

      {/* Key Analytics */}
      <div className="analytics-summary">
        <h3>Summary</h3>
        <ul>
          <li><strong>Total Evaluations:</strong> {analytics.count || 0}</li>
          <li><strong>Best Score:</strong> {analytics.bestScore || "N/A"}</li>
          <li><strong>Worst Score:</strong> {analytics.worstScore || "N/A"}</li>
          <li><strong>Top Evaluator:</strong> {analytics.topEvaluator || "N/A"}</li>
        </ul>
      </div>

      {/* Section Weakness Analysis */}
      {sectionAnalysis.length > 0 && (
        <div className="section-analysis" style={{ marginBottom: "2rem" }}>
          <h3>Section-Level Weaknesses</h3>
          <p>
            Although the vendor's overall score may appear strong, the following
            areas received lower average ratings and need attention:
          </p>
          <ul>
            {sectionAnalysis.map((s, index) => (
              <li key={index}>
                <strong>{s.section}:</strong> Average Score {s.average} — ⚠️ Below acceptable threshold
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quarterly Average Chart */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Average Score by Quarter</h3>
        <ResponsiveContainer>
          <BarChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgScore" fill="#8884d8" name="Avg Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Evaluation Count per Quarter */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Evaluation Count per Quarter</h3>
        <ResponsiveContainer>
          <BarChart data={evaluationCountPerQuarter}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ffc658" name="Evaluation Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Overall Average */}
      <div style={{ width: "100%", height: 200, marginBottom: "2rem" }}>
        <h3>Overall Average Evaluation Score</h3>
        {avgScore ? (
          <ResponsiveContainer>
            <BarChart data={[{ vendorName, avgScore: parseFloat(avgScore) }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendorName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avgScore"
                fill="#8884d8"
                name="Average Score"
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>No average score available.</p>
        )}
      </div>

      {/* Score Interpretation */}
      <div className="score-meaning" style={{ marginBottom: "2rem" }}>
        <h3>What Does This Score Mean?</h3>
        <ul>
          <li><strong>90 – 100:</strong> Excellent performance, meets or exceeds expectations.</li>
          <li><strong>70 – 89:</strong> Good performance, mostly meets requirements.</li>
          <li><strong>50 – 69:</strong> Average performance, some improvements needed.</li>
          <li><strong>Below 50:</strong> Poor performance, significant issues identified.</li>
        </ul>
        <p>
          This scoring system helps compare vendors fairly and guide decisions for approval,
          retention, or improvement.
        </p>
      </div>

      {/* Evaluation Table */}
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
