import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../cssFiles/PreQualification.css";
import { getCurrentUserDoc } from "../../utils/getUserDoc";

function PreQualification() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const VendorName = params.get("vendor");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [monopoly, setMonopoly] = useState("");
  const [monopolyComment, setMonopolyComment] = useState("");
  const [legal, setLegal] = useState("");
  const [userAccess, setUserAccess] = useState(null);


  useEffect(() => {
  const fetchQuestions = async () => {
    const userData = await getCurrentUserDoc();

    if (!userData?.access?.prerequisite) {
      console.log("🔁 Skipping Pre-Qualification. Redirecting to Evaluation.");
      navigate(
        `/evaluationform?vendorId=${vendorId}&vendor=${encodeURIComponent(
          VendorName
        )}`
      );
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "preevaluation"));
      // ... your filtering and sorting logic
    } catch (error) {
      console.error("Failed to fetch pre-evaluation questions:", error);
    }
    
  };

  fetchQuestions();
}, []);

  const handleNext = () => {
    const currentCriterion = questions[step]?.criteria.toLowerCase();

    // Validate monopoly answer
    if (currentCriterion === "monopoly") {
      if (!monopoly) {
        alert("❌ Please answer the monopoly question.");
        return;
      }
      if (monopoly === "yes" && !monopolyComment.trim()) {
        alert("❌ Please specify an alternative vendor for monopoly risk.");
        return;
      }
    }

    // Validate legal answer
    if (currentCriterion === "legal") {
      if (!legal) {
        alert("❌ Please answer the legal compliance question.");
        return;
      }
      if (legal === "no") {
        alert("❌ Vendor disqualified due to legal non-compliance.");
        navigate("/dashboard");
        return;
      }
    }

    // Proceed to next step
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Final submission navigation
      navigate(
        `/evaluationform?vendorId=${vendorId}&vendor=${encodeURIComponent(
          VendorName
        )}`
      );
    }
  };

  const current = questions[step];

  if (!current) return <div className="loading">Loading...</div>;

  return (
    <div className="prequal-wrapper">
      <div className="prequal-sidebar">
        <img src="/images/iscore-logo.png" alt="logo" className="logo" />
        {questions.map((q, i) => (
          <div key={i} className={`sidebar-step ${i === step ? "active" : ""}`}>
            <span>🟣</span>
            <div>
              {q.criteria.toLowerCase() === "monopoly"
                ? "Monopoly risk"
                : "Legal & Compliance"}
            </div>
          </div>
        ))}
      </div>

      <div className="prequal-content">
        <h3 className="vendor-title">{VendorName} Pre-Qualification</h3>
        <h4 className="section-title">
          Section:{" "}
          {current.criteria.toLowerCase() === "monopoly"
            ? "Monopoly risk"
            : "Legal & Regulatory Compliance"}
        </h4>

        <p className="question-text">{current.question}</p>

        {current.criteria.toLowerCase() === "monopoly" && (
          <>
            <div className="btn-group">
              <button
                className={`choice-btn ${monopoly === "yes" ? "selected" : ""}`}
                onClick={() => setMonopoly("yes")}
              >
                Yes
              </button>
              <button
                className={`choice-btn ${monopoly === "no" ? "selected" : ""}`}
                onClick={() => setMonopoly("no")}
              >
                No
              </button>
            </div>
            {monopoly === "yes" && (
              <textarea
                placeholder="e.g. Company B or any other international supplier"
                value={monopolyComment}
                onChange={(e) => setMonopolyComment(e.target.value)}
                className="comment-box"
              />
            )}
          </>
        )}

        {current.criteria.toLowerCase() === "legal" && (
          <div className="btn-group">
            <button
              className={`choice-btn ${legal === "yes" ? "selected" : ""}`}
              onClick={() => setLegal("yes")}
            >
              Yes – meets all legal and regulatory requirements
            </button>
            <button
              className={`choice-btn ${legal === "no" ? "selected" : ""}`}
              onClick={() => setLegal("no")}
            >
              No – disqualified due to non-compliance
            </button>
          </div>
        )}

        <div className="action-btns">
          <button
            className="back-btn"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Back
          </button>

          <button className="next-btn" onClick={handleNext}>
            {step === questions.length - 1 ? "Submit" : "Next"}
          </button>

          <button className="exit-btn" onClick={() => navigate("/dashboard")}>
            Exit to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreQualification;
