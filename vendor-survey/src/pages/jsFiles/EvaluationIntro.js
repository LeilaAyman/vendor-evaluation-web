import React from "react";
import "../cssFiles/EvaluationIntro.css";
import { useNavigate } from "react-router-dom";

function EvaluationIntro() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/evaluate");
  };
  const startEvaluation =()=>{
    navigate("/evaluationflow");
  }

  return (
    

      <div className="evaluation-page">
        <div className="evaluation-container">
          <div className="evaluation-header">
      <div className="left-header">
        <div className="back-button" onClick={goBack}>
          ← Back
        </div>
      </div>
            <img src="/images/iscore-logo.png" alt="Iscore Logo" className="evaluation-logo" />
          </div>

          <div className="evaluation-content">
            <p className="evaluation-text">
              This is the <strong>2025 Q2 vendor evaluation</strong>. You are required to submit an evaluation for <strong>5 vendors</strong>.
            </p>

            <button className="start-button" onClick={startEvaluation}>
              Start Evaluation
            </button>
          </div>
        </div>
      
    </div>
  );
}

export default EvaluationIntro;
