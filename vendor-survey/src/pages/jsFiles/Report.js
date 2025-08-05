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

const MAX_SCORES = {
  finance: 30,
  both: 25,
  IT: 35,
};

// Helper to get query param
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function Report() {
  const [evaluations, setEvaluations] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [deptBreakdown, setDeptBreakdown] = useState(null);
  const query = useQuery();
  const vendorName = query.get("vendor");

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
            normalized: {
              both: totalScores.both
                ? ((totalScores.both / MAX_SCORES.both) * 100).toFixed(2)
                : "0.00",
              finance: totalScores.finance
                ? ((totalScores.finance / MAX_SCORES.finance) * 100).toFixed(2)
                : "0.00",
              IT: totalScores.IT
                ? ((totalScores.IT / MAX_SCORES.IT) * 100).toFixed(2)
                : "0.00",
            },
          },
        };
      });

      const vendorEvals = allEvals.filter(
        (e) =>
          e.vendorName?.toLowerCase().trim() ===
          vendorName?.toLowerCase().trim()
      );

      setEvaluations(vendorEvals);

      let totalPercentages = {
        both: 0,
        finance: 0,
        IT: 0,
      };
      let counts = {
        both: 0,
        finance: 0,
        IT: 0,
      };

      vendorEvals.forEach((e) => {
        for (let dept of ["both", "finance", "IT"]) {
          const rawScore = e.departmentScores[dept];
          const max = MAX_SCORES[dept];
          if (rawScore > 0) {
            totalPercentages[dept] += (rawScore / max) * 100;
            counts[dept]++;
          }
        }
      });

      const deptAvgs = Object.entries(totalPercentages).map(([dept, sum]) => {
        return counts[dept] > 0 ? sum / counts[dept] : 0;
      });

      const activeDepts = deptAvgs.filter((v) => v > 0);
      const finalAvg =
        activeDepts.length > 0
          ? (
              activeDepts.reduce((a, b) => a + b, 0) / activeDepts.length
            ).toFixed(2)
          : null;

      setAvgScore(finalAvg);
      setDeptBreakdown({ totalPercentages, counts });
    };

    fetchEvaluations();
  }, [vendorName]);

  return (
    <div className="report-container">
      <h2 className="report-title">Report for: {vendorName}</h2>

      {/* Line Chart */}
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <h3>Performance</h3>
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
                dataKey="departmentScores.both"
                stroke="#8884d8"
                name="Both Dept"
              />
              <Line
                type="monotone"
                dataKey="departmentScores.finance"
                stroke="#82ca9d"
                name="Finance Dept"
              />
              <Line
                type="monotone"
                dataKey="departmentScores.IT"
                stroke="#ff6f61"
                name="IT Dept"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No evaluation data available.
          </p>
        )}
      </div>

      {/* Average Score Bar Chart */}
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

      {/* Department Breakdown Chart */}
      {deptBreakdown && (
        <div style={{ width: "100%", height: 250, marginBottom: "2rem" }}>
          <h3>Department-Wise Average Scores</h3>
          <ResponsiveContainer>
            <BarChart
              data={[
                {
                  department: "Both",
                  avg:
                    deptBreakdown.counts.both > 0
                      ? parseFloat(
                          (
                            deptBreakdown.totalPercentages.both /
                            deptBreakdown.counts.both
                          ).toFixed(2)
                        )
                      : 0,
                },
                {
                  department: "Finance",
                  avg:
                    deptBreakdown.counts.finance > 0
                      ? parseFloat(
                          (
                            deptBreakdown.totalPercentages.finance /
                            deptBreakdown.counts.finance
                          ).toFixed(2)
                        )
                      : 0,
                },
                {
                  department: "IT",
                  avg:
                    deptBreakdown.counts.IT > 0
                      ? parseFloat(
                          (
                            deptBreakdown.totalPercentages.IT /
                            deptBreakdown.counts.IT
                          ).toFixed(2)
                        )
                      : 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" fill="#4F3795" name="Avg %" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
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
