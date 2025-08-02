import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useNavigate } from "react-router-dom";

function Evaluation() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/select-vendor");
  }, [navigate]);

  return null; // blank screen before redirect
}

export default Evaluation;

