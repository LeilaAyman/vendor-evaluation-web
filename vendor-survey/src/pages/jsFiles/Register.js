import { useState } from "react";
import "../cssFiles/Register.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebase.js";
import { useNavigate } from "react-router-dom";

const auth = getAuth(app);

function Register() {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const goBack = () => {
    navigate("/login");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="back-button" onClick={goBack}>
        ← Back
      </div>
    <div className="register-container">
      <div className="left-panel">
        <img src="/images/iscore-logo.png" alt="Iscore Logo" className="logo" />
      </div>

      <div className="right-panel">
        <h2>Create an account</h2>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="input-group">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="example example"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="example@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">🔑</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              👁️
            </span>
          </div>

          <div className="input-group">
            <span className="icon">🔑</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              👁️
            </span>
          </div>

          <div className="input-group">
            <span className="icon">🆔</span>
            <input
              type="text"
              placeholder="S123456"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <button type="submit" className="register-button">
            Create Account
          </button>

          <p className="login-link">
            Already have an account? <a href="/login">login</a>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
}

export default Register;
