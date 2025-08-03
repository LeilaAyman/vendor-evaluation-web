import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "../cssFiles/EvaluationForm.css";

function EvaluationForm() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const vendorName = decodeURIComponent(params.get("vendor") || "");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedScore, setSelectedScore] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const existingSnap = await getDocs(collection(db, "existing questions"));
      const existingQuestions = existingSnap.docs.map((doc, idx) => ({
        id: doc.id,
        text: doc.data().question,
        weight: doc.data().weight || 1,
        criteria: doc.data().criteria || "Uncategorized",
        source: "existing",
        order: idx,
      }));

      const allSnap = await getDocs(collection(db, "existing_and_new"));
      const allQuestions = allSnap.docs.map((doc, idx) => ({
        id: doc.id,
        text: doc.data().question,
        weight: doc.data().weight || 1,
        criteria: doc.data().criteria || "Uncategorized",
        source: "existing_and_new",
        order: existingQuestions.length + idx,
      }));

      const combined = [...existingQuestions, ...allQuestions];
      const grouped = combined.reduce((acc, q) => {
        const key = q.criteria;
        acc[key] = acc[key] || [];
        acc[key].push(q);
        return acc;
      }, {});
      const sortedGrouped = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
      const finalQuestions = sortedGrouped.flatMap(([_, qs]) => qs);
      setQuestions(finalQuestions);
      setCurrent(0);
      setResponses({});
      setSelectedScore(null);
    };

    fetchQuestions();
  }, []);

  const handleSubmitScore = async () => {
    const currentQ = questions[current];

    const updatedResponses = {
      ...responses,
      [currentQ.id]: {
        score: selectedScore,
        weight: currentQ.weight,
        text: currentQ.text,
      },
    };

    setResponses(updatedResponses);
    setSelectedScore(null);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      const confirm = window.confirm("✅ Evaluation complete! Would you like to evaluate another vendor?");
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("User not signed in. Cannot save evaluation.");
        return;
      }

      // Fetch evaluator name from 'users' collection
      let evaluatorName = "Unknown";
      try {
        const userSnap = await getDocs(collection(db, "users"));
        const userDoc = userSnap.docs.find((doc) => doc.data().uid === user.uid);
        if (userDoc) {
          evaluatorName = userDoc.data().name || "Unknown";
        }
      } catch (err) {
        console.error("Could not fetch evaluator name:", err);
      }

      const totalScore = Object.values(updatedResponses).reduce((acc, item) => {
        const weighted = (item.score / 5) * item.weight;
        return acc + weighted;
      }, 0);

      const evaluationData = {
        userId: user.uid,
        evaluatorName,
        vendorId,
        vendorName,
        responses: updatedResponses,
        totalScore: parseFloat(totalScore.toFixed(2)),
        submittedAt: new Date(),
      };

      try {
        await addDoc(collection(db, "evaluations"), evaluationData);
        if (confirm) {
          navigate("/select-vendor");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error saving evaluation:", error);
        alert("❌ Failed to save evaluation.");
      }
    }
  };

  const currentQuestion = questions[current];

  return (
    <div className="eval-wrapper">
      <div className="eval-sidebar">
        <img src="/images/iscore-logo.png" alt="logo" className="logo" />
        {questions.map((q, i) => (
          <div key={q.id} className={`sidebar-step ${i === current ? "active" : ""}`}>
            <span>{i + 1}</span>
            <p>{q.text}</p>
          </div>
        ))}
      </div>

      <div className="eval-content">
        <h5 className="vendor-title">Evaluating: {vendorName}</h5>
        {currentQuestion && (
          <>
            <h5 className="criteria-label">{currentQuestion.criteria}</h5>
            <p className="question-number">Question {current + 1} of {questions.length}</p>
            <h3 className="question-text">{currentQuestion.text}</h3>

            <div className="score-options">
              {[1, 2, 3, 4, 5].map((score) => (
                <div className="score-container" key={score}>
                  <button
                    className={`score-circle score-${score} ${selectedScore === score ? "selected" : ""}`}
                    onClick={() => setSelectedScore(score)}
                  >
                    {score}
                  </button>
                  {(score === 1 || score === 5) && (
                    <div className={`score-label ${score === 1 ? "left" : "right"}`}>
                      {score === 1 ? "Poor" : "Excellent"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="submit-score-btn"
              onClick={handleSubmitScore}
              disabled={selectedScore === null}
              style={{ marginTop: "20px" }}
            >
              Submit Score
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EvaluationForm;
