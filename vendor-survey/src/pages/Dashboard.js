import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vendorFeedback"));
        const feedbackList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbacks(feedbackList);
      } catch (error) {
        console.error("❌ Error fetching feedback:", error);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Vendor</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Feedback</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                No feedback submitted yet.
              </td>
            </tr>
          ) : (
            feedbacks.map((fb) => (
              <tr key={fb.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{fb.name}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{fb.vendor}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{fb.feedback}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {fb.createdAt
                    ? new Date(fb.createdAt.seconds * 1000).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
