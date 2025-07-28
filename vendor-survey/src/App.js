import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Evaluation from "./pages/Evaluation";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import PreQualification from "./pages/PreQualification"; // New import
import EvaluationForm from "./pages/EvaluationForm"; // 
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-content">
            <Link to="/"><button className="sidebar-btn">🏠 Dashboard</button></Link>
            <Link to="/evaluation"><button className="sidebar-btn">📝 Evaluation</button></Link>
            <Link to="/profile"><button className="sidebar-btn">👤 Profile</button></Link>
            <Link to="/login"><button className="sidebar-btn">🔑 Login</button></Link>
          </div>
        </div>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prequalification" element={<PreQualification />} /> {/* ✅ New route */}
            <Route path="/evaluationform" element={<EvaluationForm />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
