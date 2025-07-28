import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function PreQualification() {
  const [params] = useSearchParams();
  const vendor = params.get("vendor");
  const navigate = useNavigate();

  const [monopoly, setMonopoly] = useState("");
  const [monopolyComment, setMonopolyComment] = useState("");
  const [legal, setLegal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (monopoly === "yes" && monopolyComment.trim() === "") {
      alert("❌ Please specify an alternative vendor for monopoly risk.");
      return;
    }

    if (legal === "no") {
      alert("❌ Vendor disqualified due to legal non-compliance.");
      return;
    }

    navigate(`/evaluationform?vendor=${encodeURIComponent(vendor)}`);
  };

  return (
    <div className="container mt-5 p-4 shadow rounded bg-white">
      <h2 className="mb-4">Pre-Qualification for <strong>{vendor}</strong></h2>
      <form onSubmit={handleSubmit}>
        {/* Monopoly Question */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            Does this vendor operate as the sole provider (monopoly) for the required solution or service in Egypt or globally?
          </label>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="monopoly"
              id="monopolyYes"
              value="yes"
              checked={monopoly === "yes"}
              onChange={(e) => setMonopoly(e.target.value)}
              required
            />
            <label className="form-check-label" htmlFor="monopolyYes">
              Yes – Vendor appears to be the only available provider.
              <br />
              <small className="text-muted">
                Please specify an alternative vendor if possible.
              </small>
            </label>
          </div>

          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="radio"
              name="monopoly"
              id="monopolyNo"
              value="no"
              checked={monopoly === "no"}
              onChange={(e) => setMonopoly(e.target.value)}
            />
            <label className="form-check-label" htmlFor="monopolyNo">
              No – Vendor operates in a competitive market.
            </label>
          </div>

          {monopoly === "yes" && (
            <div className="mt-3">
              <label htmlFor="monopolyComment" className="form-label">
                Suggested Alternative Vendor (required):
              </label>
              <textarea
                className="form-control"
                id="monopolyComment"
                rows="3"
                placeholder="e.g., Company B, or an international supplier..."
                value={monopolyComment}
                onChange={(e) => setMonopolyComment(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Legal Compliance Question */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            Does the vendor hold all valid and required commercial registrations, licenses, and approvals necessary to legally operate and provide the proposed services/products in Egypt, and is the vendor in good legal standing?
          </label>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="legal"
              id="legalYes"
              value="yes"
              checked={legal === "yes"}
              onChange={(e) => setLegal(e.target.value)}
              required
            />
            <label className="form-check-label" htmlFor="legalYes">
              Yes – Meets all legal and regulatory requirements.
            </label>
          </div>

          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="radio"
              name="legal"
              id="legalNo"
              value="no"
              checked={legal === "no"}
              onChange={(e) => setLegal(e.target.value)}
            />
            <label className="form-check-label" htmlFor="legalNo">
              No – Does not meet legal and regulatory requirements.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-success w-100 mt-4">
          {legal === "yes" ? "✅ Proceed to Full Evaluation" : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default PreQualification;
