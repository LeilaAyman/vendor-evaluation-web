import { useState } from "react";
import '../cssFiles/Login.css';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebase.js";
import { useNavigate } from "react-router-dom";

const auth = getAuth(app);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src="/images/iscore-logo.png" alt="Iscore Logo" className="logo" />
      </div>

      <div className="right-panel">
        <h2>Welcome to</h2>
        <h1><strong>Iscore Vendor Evaluation</strong></h1>

        <form className="login-form" onSubmit={handleLogin}>
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
            >👁️</span>
          </div>

        

          <button type="submit" className="login-button">Login</button>

          <p className="register-link">
            Don’t have an account?{" "}
            <span
              style={{ color: "#3f2b96", fontWeight: "bold", cursor: "pointer" }}
              onClick={goToRegister}
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
