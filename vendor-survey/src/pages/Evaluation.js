import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

function Evaluation() {
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "vendorFeedback"), {
        name,
        vendor,
        feedback,
        createdAt: new Date(),
      });
      alert("✅ Feedback submitted successfully!");
      setName("");
      setVendor("");
      setFeedback("");
    } catch (error) {
      alert("❌ Error submitting feedback: " + error.message);
    }
  };

  return (
    <div className="page">
      <h2>Vendor Insight Survey</h2>
      <form onSubmit={handleSubmit}>
        <label>Your Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Vendor Name:</label>
        <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} required />

        <label>Feedback:</label>
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required />

        <button type="submit" className="submit-btn">Submit Feedback</button>
      </form>
    </div>
  );
}

export default Evaluation;
