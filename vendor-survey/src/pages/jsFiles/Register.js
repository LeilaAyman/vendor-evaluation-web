import { useState } from "react";
import "../cssFiles/Register.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../../firebase.js";
import { useNavigate } from "react-router-dom";

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

function Register() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("employee"); // NEW: default to employee
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user info to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        department,
        type, // NEW
        uid: userCredential.user.uid,
        createdAt: new Date(),
      });

      alert("✅ Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        <div className="left-panel">
          <img
            src={require("../../iscore-logo.png")}
            alt="Logo"
            style={{
              width: "70%",
              maxWidth: "300px",
              height: "auto",
              marginBottom: "20px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </div>

        <div className="right-panel">
          <h2>Create an account</h2>
          <form className="register-form" onSubmit={handleRegister}>
            <div className="input-group">
              <span className="icon">👤</span>
              <input
                type="text"
                placeholder="FisrtName LastName"
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
              <span className="icon">🏢</span>
              <input
                type="text"
                placeholder="Department (e.g. HR, IT)"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            {/* NEW: Type Dropdown */}
            <div className="input-group">
              <span className="icon">👥</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
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
