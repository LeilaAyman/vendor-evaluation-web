import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

function EvaluationFlow() {
  const [vendors, setVendors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      const snapshot = await getDocs(collection(db, "vendors"));
      const vendorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendors(vendorList);
    };

    fetchVendors();
  }, []);

  const startPreEvaluation = () => {
    const vendor = vendors[currentIndex];
    if (vendor) {
      navigate(`/prequalification?vendorId=${vendor.id}&vendor=${encodeURIComponent(vendor.name)}&index=${currentIndex}`);

    }
  };

  useEffect(() => {
    if (vendors.length > 0) {
      startPreEvaluation();
    }
  }, [vendors]);

  return <div>Loading vendor list...</div>;
}

export default EvaluationFlow;
