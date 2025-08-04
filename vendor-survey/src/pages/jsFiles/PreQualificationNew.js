import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import "../cssFiles/PreQualification.css";
import { getCurrentUserDoc } from "../../utils/getUserDoc";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

function PreQualificationNew() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const VendorName = params.get("vendor");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchQuestionsAndUser = async () => {
      const userData = await getCurrentUserDoc();

      if (!userData) {
        toast.error("⚠️ Failed to retrieve user data.");
        navigate("/dashboard");
        return;
      }

      setUserId(userData?.uid || userData?.id);

      try {
        const snapshot = await getDocs(collection(db, "preevaluation"));
        const validQuestions = snapshot.docs
          .map((doc) => doc.data())
          .filter(
            (q) =>
              typeof q.criteria === "string" &&
              typeof q.question === "string" &&
              q.criteria.trim() !== "" &&
              q.question.trim() !== ""
          )
          .sort((a, b) =>
            a.criteria.toLowerCase().localeCompare(b.criteria.toLowerCase())
          );

        setQuestions(validQuestions);
      } catch (error) {
        toast.error("❌ Failed to fetch prequalification questions.");
        console.error("Firestore error:", error);
      }
    };

    fetchQuestionsAndUser();
  }, [navigate, vendorId, VendorName]);

  const handleAnswer = async (value) => {
    const updated = { ...answers, [step]: value };
    setAnswers(updated);

    if (value === "no") {
      const result = await Swal.fire({
        icon: "warning",
        title: "Vendor Disqualification",
        text: "❌ This answer indicates noncompliance. The vendor will be disqualified.",
        confirmButtonText: "Discard Vendor",
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        try {
          await addDoc(collection(db, "discarded_new_vendors"), {
            vendorId,
            vendorName: VendorName,
            reason: "Prequalification failure",
            discardedBy: userId,
            discardedAt: Timestamp.now(),
          });

          await Swal.fire({
            icon: "info",
            title: "Vendor Discarded",
            text: "⚠️ The vendor has been marked as disqualified and will not proceed to evaluation.",
            confirmButtonText: "Back to Dashboard",
          });

          navigate("/dashboard");
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Failed to Record Discard",
            text: err.message,
          });
        }
      }
    }
  };

  const handleNext = () => {
    if (!answers[step]) {
      toast.error("⚠️ Please answer this question before proceeding.");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      Swal.fire({
        icon: "success",
        title: "Vendor Prequalified",
        text: "✅ All answers indicate compliance. Proceeding to evaluation...",
        confirmButtonText: "Continue to Evaluation",
      }).then(() => {
        navigate(
          `/evaluationformnew?vendorId=${vendorId}&vendor=${encodeURIComponent(
            VendorName
          )}&type=new`
        );
      });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = questions[step];
  if (!current) return <div className="loading">Loading questions...</div>;

  return (
    <div className="prequal-wrapper">
      <Toaster position="top-right" />
      <div className="prequal-sidebar">
        <img src="/images/iscore-logo.png" alt="logo" className="logo" />
        {questions.map((_, i) => (
          <div key={i} className={`sidebar-step ${i === step ? "active" : ""}`}>
            <span>📋</span> Question {i + 1}
          </div>
        ))}
      </div>

      <div className="prequal-content">
        <h3 className="vendor-title">{VendorName} Pre-Qualification</h3>
        <h4 className="section-title">{current.criteria}</h4>

        <p className="question-text">{current.question}</p>

        <div className="btn-group">
          <button
            className={`choice-btn ${
              answers[step] === "yes" ? "selected" : ""
            }`}
            onClick={() => handleAnswer("yes")}
          >
            ✅ Yes – vendor is compliant
          </button>
          <button
            className={`choice-btn ${answers[step] === "no" ? "selected" : ""}`}
            onClick={() => handleAnswer("no")}
          >
            ❌ No – vendor is not compliant
          </button>
        </div>

        <div className="action-btns">
          <button
            className="back-btn"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </button>
          <button className="next-btn" onClick={handleNext}>
            {step === questions.length - 1 ? "Finish" : "Next"}
          </button>
          <button className="exit-btn" onClick={() => navigate("/dashboard")}>
            Exit to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreQualificationNew;
