// Updated EvaluationForm.js with proper flow
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/EvaluationForm.css";

function EvaluationForm() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const vendorName = decodeURIComponent(params.get("vendor") || "");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});

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
    };

    fetchQuestions();
  }, []);

  const handleScore = (score) => {
    const currentQ = questions[current];
    setResponses((prev) => ({ ...prev, [currentQ.id]: score }));
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Evaluation complete, offer next step
      const choice = window.confirm("✅ Evaluation complete! Would you like to evaluate another vendor?");
      if (choice) {
        navigate("/select-vendor");
      } else {
        navigate("/dashboard");
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
                  <button className={`score-circle score-${score}`} onClick={() => handleScore(score)}>
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
          </>
        )}
      </div>
    </div>
  );
}

export default EvaluationForm;
