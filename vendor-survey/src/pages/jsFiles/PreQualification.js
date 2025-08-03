import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import "../cssFiles/PreQualification.css";
import { getCurrentUserDoc } from "../../utils/getUserDoc";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

function PreQualification() {
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

      setUserId(userData?.uid || userData?.id); // adapt depending on your getCurrentUserDoc shape

      if (!userData?.access?.prerequisite) {
        navigate(`/evaluationform?vendorId=${vendorId}&vendor=${encodeURIComponent(VendorName)}`);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "preevaluation"));
        const legalQuestions = snapshot.docs
          .map((doc) => doc.data())
          .filter((q) => q.criteria === "Legal & Regulatory Compliance");

        setQuestions(legalQuestions);
      } catch (error) {
        toast.error("❌ Failed to fetch legal prequalification questions.");
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
        title: "Regulatory Noncompliance",
        text: "❌ Vendor will be discarded due to regulatory noncompliance.",
        confirmButtonText: "Confirm Discard",
        showCancelButton: true,
        cancelButtonText: "Stay Here",
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        try {
          await addDoc(collection(db, "discarded_vendors"), {
            vendorId,
            vendorName: VendorName,
            reason: "Regulatory noncompliance",
            discardedBy: userId,
            discardedAt: Timestamp.now(),
          });

          await Swal.fire({
            icon: "success",
            title: "Vendor Discarded",
            text: "✅ The vendor has been successfully disqualified and recorded.",
            confirmButtonText: "OK",
          });

          navigate("/select-vendor");
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
      const allPassed = Object.values(answers).every((ans) => ans === "yes");
      if (allPassed) {
        navigate(`/evaluationform?vendorId=${vendorId}&vendor=${encodeURIComponent(VendorName)}`);
      } else {
        toast.error("❌ Vendor disqualified. All legal questions must be passed.");
        navigate("/dashboard");
      }
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
        <h4 className="section-title">Legal & Regulatory Compliance</h4>

        <p className="question-text">{current.question}</p>

        <div className="btn-group">
          <button
            className={`choice-btn ${answers[step] === "yes" ? "selected" : ""}`}
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
          <button className="back-btn" onClick={handleBack} disabled={step === 0}>
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
