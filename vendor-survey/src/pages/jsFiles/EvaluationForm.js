import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/EvaluationForm.css";

function EvaluationForm() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const vendorName = decodeURIComponent(params.get("vendor") || "");
  const index = parseInt(params.get("index") || "0", 10);

  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const hardcodedQuestions = [
      { id: "q1", text: "How would you rate the vendor’s responsiveness?" },
      { id: "q2", text: "How satisfied are you with the vendor’s technical support?" },
      { id: "q3", text: "Rate the vendor's adherence to deadlines." },
      { id: "q4", text: "How likely are you to continue working with this vendor?" },
      { id: "q5", text: "Overall, how would you score the vendor’s performance?" }
    ];

    setQuestions(hardcodedQuestions);

    const fetchVendors = async () => {
      const vs = await getDocs(collection(db, "vendors"));
      setVendors(vs.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchVendors();
  }, []);

  const handleScore = (score) => {
    const currentQ = questions[current];
    setResponses((prev) => ({ ...prev, [currentQ.id]: score }));

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      proceedToNextVendor();
    }
  };

  const proceedToNextVendor = () => {
    const nextIndex = index + 1;
    const nextVendor = vendors[nextIndex];

    if (nextVendor) {
      navigate(`/prequalification?vendorId=${nextVendor.id}&vendor=${encodeURIComponent(nextVendor.name)}&index=${nextIndex}`);
    } else {
      alert("✅ All vendors evaluated.");
      navigate("/dashboard");
    }
  };

  const currentQuestion = questions[current];
  if (!currentQuestion) return <div>Loading question...</div>;

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
        <h5 className="vendor-title">{vendorName}</h5>

        <p className="question-number">Question {current + 1} of {questions.length}</p>
        <h3 className="question-text">{currentQuestion.text}</h3>

        <div className="score-options">
          {[1, 2, 3, 4, 5].map((score) => (
            <div className="score-container" key={score}>
              <button
                className={`score-circle score-${score}`}
                onClick={() => handleScore(score)}
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

        <div className="action-btn" style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            ← Back to Dashboard
          </button>

          <button
            className="next-btn"
            onClick={proceedToNextVendor}
            disabled={current !== questions.length - 1}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: current !== questions.length - 1 ? "not-allowed" : "pointer"
            }}
          >
            {current === questions.length - 1 ? "Finish Evaluation" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EvaluationForm;
