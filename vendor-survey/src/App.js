import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/jsFiles/Dashboard";
import Evaluation from "./pages/jsFiles/Evaluation";
import Evaluate from "./pages/jsFiles/Evaluate";
import Profile from "./pages/jsFiles/Profile";
import Login from "./pages/jsFiles/Login";
import Register from "./pages/jsFiles/Register";
import PreQualification from "./pages/jsFiles/PreQualification"; // New import
import EvaluationFlow from "./pages/jsFiles/VendorFlow";
import EvaluationForm from "./pages/jsFiles/EvaluationForm"; // 
import EvaluationIntro from "./pages/jsFiles/EvaluationIntro"; // 
import Report from "./pages/jsFiles/Report"; // New import
import VendorSelection from "./pages/jsFiles/vendorSelection"; // New import
import ScorePage from "./pages/jsFiles/ScorePage"; // New import
import 'bootstrap/dist/css/bootstrap.min.css';
import EvaluationSettings from "./pages/jsFiles/EvaluationSettings"; // Adjust path if needed
import AccessControl from "./pages/jsFiles/AccessControl"; // New import




function App() {
  return (
    <Router>
      <div className="app-container">

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/evaluationflow" element={<EvaluationFlow />} />
            <Route path="/prequalification" element={<PreQualification />} />
            <Route path="/evaluationform" element={<EvaluationForm />} />
            <Route path="/Report" element={<Report />} />
            <Route path="/evaluation-settings" element={<EvaluationSettings />} />
            <Route path="/ScorePage" element={<ScorePage />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/select-vendor" element={<VendorSelection />} />
            <Route path="/evaluation_intro" element={<EvaluationIntro />} />
            <Route path="/AccessControl" element={<AccessControl />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
