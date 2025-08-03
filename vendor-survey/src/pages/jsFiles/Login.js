import { useState } from "react";
import "../cssFiles/Login.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebase.js";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

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
      navigate("/dashboard");
    } catch (error) {
      let message = "❌ Login failed!";
      if (error.code === "auth/network-request-failed") {
        message = "📡 Network error. Please check your connection.";
      } else if (error.code === "auth/user-not-found") {
        message = "🔍 User not found. Please register first.";
      } else if (error.code === "auth/wrong-password") {
        message = "🔑 Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        message = "✉️ Invalid email format.";
      }
      else{
        message = "🔍 User not found. Please register first.";
      }
      toast.error(message, { duration: 3000 });
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="left-panel">
        <img src="/images/iscore-logo.png" alt="Iscore Logo" className="logo" />
      </div>

      <div className="right-panel">
        <h2>Welcome to</h2>
        <h1>
          <strong>Iscore Vendor Evaluation</strong>
        </h1>

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
            >
              👁️
            </span>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          <p className="register-link">
            Don’t have an account?{" "}
            <span
              style={{
                color: "#3f2b96",
                fontWeight: "bold",
                cursor: "pointer",
              }}
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
