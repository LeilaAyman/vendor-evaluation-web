// utils/getCurrentUserDoc.js
import { getDocs, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

export const getCurrentUserDoc = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  const userSnap = await getDocs(collection(db, "users"));
  const userDoc = userSnap.docs.find((doc) => doc.data().uid === user.uid);
  return userDoc ? userDoc.data() : null;
};
