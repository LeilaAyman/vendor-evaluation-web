import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/PreQualification.css"

function PreQualification() {
  const [params] = useSearchParams();
  const vendorId = params.get("vendorId");
  const VendorName= params.get("vendor");
  const index = parseInt(params.get("index") || "0", 10);
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [allVendors, setAllVendors] = useState([]);

  const [monopoly, setMonopoly] = useState("");
  const [monopolyComment, setMonopolyComment] = useState("");
  const [legal, setLegal] = useState("");

  useEffect(() => {
    const fetchVendor = async () => {
      const vendorSnap = await getDoc(doc(db, "vendors", vendorId));
      setVendor({ id: vendorSnap.id, ...vendorSnap.data() });

      const snapshot = await getDocs(collection(db, "vendors"));
      const vendorList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllVendors(vendorList);
    };

    fetchVendor();
  }, [vendorId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (monopoly === "yes" && monopolyComment.trim() === "") {
      alert("❌ Please specify an alternative vendor for monopoly risk.");
      return;
    }

    if (legal === "no") {
      alert("❌ Vendor disqualified due to legal non-compliance.");
      proceedToNext();
      return;
    }

    navigate(`/evaluationform?vendorId=${vendorId}&vendor=${encodeURIComponent(vendor.name)}&index=${index}`);
  };

 const proceedToNext = () => {
  const nextIndex = index + 1;
  const nextVendor = allVendors[nextIndex];

  if (nextVendor) {
    navigate(`/prequalification?vendorId=${nextVendor.id}&vendor=${encodeURIComponent(nextVendor.name)}&index=${nextIndex}`);
  } else {
    alert("✅ All vendors evaluated.");
    navigate("/dashboard");
  }
};


  if (!vendor) return <div>Loading...</div>;

  return (
    <div className="pre-eval-wrapper">
      <div className="pre-eval-sidebar">
        <img src="/images/iscore-logo.png" alt="logo" className="logo" />
        <div className="sidebar-step">
          <span>🟣</span>
          <div>
            <p>How did you first learn about our product?</p>
          </div>
        </div>
        <div className="sidebar-step">
          <span>🟣</span>
          <div>
            <p>How likely are you to recommend our product to a friend or colleague?</p>
          </div>
        </div>
      </div>

      <div className="pre-eval-content">
        <h5 className="vendor-title">{VendorName} pre-evaluation</h5>

        <form onSubmit={handleSubmit}>
          <label className="question-label">
            Does this vendor operate as the sole provider (monopoly) for the required solution or service in Egypt or globally?
            <br />
            <span className="subtext">If yes, please specify an alternative or a suggestion if possible</span>
          </label>

          <div className="btn-group">
            <button
              type="button"
              className={`choice-btn ${monopoly === "yes" ? "selected" : ""}`}
              onClick={() => setMonopoly("yes")}
            >
              yes
            </button>
            <button
              type="button"
              className={`choice-btn ${monopoly === "no" ? "selected" : ""}`}
              onClick={() => setMonopoly("no")}
            >
              no
            </button>
          </div>

          {monopoly === "yes" && (
            <textarea
              className="comment-box"
              placeholder="e.g. Company B or any other international supplier"
              value={monopolyComment}
              onChange={(e) => setMonopolyComment(e.target.value)}
            />
          )}

          {/* Hidden Legal Placeholder for future */}
          <input type="hidden" value="yes" onChange={(e) => setLegal(e.target.value)} />

          <div className="action-btn">
            <button type="submit" className="next-btn">Next</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PreQualification;
