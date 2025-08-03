import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/Profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
           setUserData({
  name: userSnap.data().name || "Not Set",
  role: userSnap.data().type || "user", // 🔧 fix here
  email: currentUser.email,
});
          
          } else {
            // Fallback if Firestore user doc doesn't exist
            setUserData({
              name: "Unknown",
              role: "Not Assigned",
              email: currentUser.email,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="page"><p>Loading profile...</p></div>;
  }

  return (
    <div className="page">
      <h2>Your Profile</h2>
      <p><strong>Name:</strong> {userData?.name}</p>
      <p><strong>Email:</strong> {userData?.email}</p>
      <p><strong>Role:</strong> {userData?.role}</p>
    </div>
  );
}

export default Profile;
