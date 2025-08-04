import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { getCurrentUserDoc } from "../../utils/getUserDoc";
import "../cssFiles/EvaluationForm.css";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

function EvaluationFormNew() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const vendorName = decodeURIComponent(params.get("vendor") || "");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedScore, setSelectedScore] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const userData = await getCurrentUserDoc();
      if (!userData?.access?.evaluation) {
        setAccessDenied(true);
        return;
      }

      const existingSnap = await getDocs(collection(db, "new"));
      const existingQuestions = existingSnap.docs.map((doc, idx) => ({
        id: doc.id,
        text: doc.data().question,
        weight: doc.data().weight || 1,
        criteria: doc.data().criteria || "Uncategorized",
        source: "new",
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
      const sortedGrouped = Object.entries(grouped).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      const finalQuestions = sortedGrouped.flatMap(([_, qs]) => qs);
      setQuestions(finalQuestions);
      setCurrent(0);
      setResponses({});
      setSelectedScore(null);
    };

    fetchQuestions();
  }, []);

  const handleSubmitScore = async () => {
    if (selectedScore === null) {
      toast.error("Please select a score before proceeding.", {
        duration: 4000,
        position: "top-center",
      });
      return;
    }

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
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("User not signed in. Cannot save evaluation.");
        return;
      }

      let evaluatorName = "Unknown";
      try {
        const userSnap = await getDocs(collection(db, "users"));
        const userDoc = userSnap.docs.find(
          (doc) => doc.data().uid === user.uid
        );
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
        Swal.fire({
          title: "Are you sure you want to submit?",
          text: "Once submitted, you won't be able to change your answers.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, submit",
          cancelButtonText: "No, go back",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        }).then(async (result) => {
          if (result.isConfirmed) {
            // Submit to Firestore
            await addDoc(collection(db, "evaluations"), evaluationData);

            // Show confirmation
            Swal.fire({
              icon: "success",
              title: "Submitted!",
              text: "Your form has been submitted successfully.",
              confirmButtonText: "Go to vendor list",
              confirmButtonColor: "#3085d6",
            }).then(() => {
              navigate("/select-vendor");
            });
          }
        });
      } catch (error) {
        console.error("Error saving evaluation:", error);
        alert("❌ Failed to save evaluation.");
      }
    }
  };

  const currentQuestion = questions[current];

  if (accessDenied) {
    return (
      <div className="eval-wrapper">
        <Toaster position="top-center" reverseOrder={false} />
        <div
          className="eval-content"
          style={{ textAlign: "center", padding: "50px" }}
        >
          <h2>❌ Access Denied</h2>
          <p>You do not have permission to evaluate vendors.</p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ marginTop: "20px" }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eval-wrapper">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="eval-sidebar">
        <img src="/images/iscore-logo.png" alt="logo" className="logo" />
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`sidebar-step ${i === current ? "active" : ""}`}
          >
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
            <p className="question-number">
              Question {current + 1} of {questions.length}
            </p>
            <h3 className="question-text">{currentQuestion.text}</h3>

            {currentQuestion.text.includes("monopoly") ? (
              <div className="score-options">
                {["Yes", "No"].map((option) => (
                  <div className="score-container" key={option}>
                    <button
                      className={`score-circle ${
                        selectedScore === option ? "selected" : ""
                      }`}
                      onClick={() => setSelectedScore(option)}
                    >
                      {option}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="score-options">
                {[1, 2, 3, 4, 5].map((score) => (
                  <div className="score-container" key={score}>
                    <button
                      className={`score-circle score-${score} ${
                        selectedScore === score ? "selected" : ""
                      }`}
                      onClick={() => setSelectedScore(score)}
                    >
                      {score}
                    </button>
                    {(score === 1 || score === 5) && (
                      <div
                        className={`score-label ${
                          score === 1 ? "left" : "right"
                        }`}
                      >
                        {score === 1 ? "Poor" : "Excellent"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="navigation-buttons">
              <div className="nav-left">
                {current > 0 && (
                  <button
                    className="back-btn"
                    onClick={() => setCurrent(current - 1)}
                  >
                    ⬅️ Back
                  </button>
                )}
              </div>
              <div className="nav-right">
                <button className="next-btn" onClick={handleSubmitScore}>
                  {current + 1 < questions.length ? "Next ➡️" : "Submit ✅"}
                </button>
              </div>
            </div>

            <button
              className="exit-btn"
              onClick={() => {
                Swal.fire({
                  title: "Exit Evaluation?",
                  text: "⚠️ Are you sure you want to exit? Your current progress will not be saved.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes, exit",
                  cancelButtonText: "No, stay",
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate("/dashboard");
                  }
                });
              }}
              style={{
                marginTop: "30px",
                backgroundColor: "#eee",
                color: "#333",
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              Exit Evaluation
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EvaluationFormNew;
