import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase"; // Ensure firebase exports `app`

const auth = getAuth(app);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("✅ Employee registered successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Logged in successfully!");
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="page">
      <h2>{isSignUp ? "Employee Sign Up" : "Employee Login"}</h2>
      <form onSubmit={handleAuth}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "10px", textAlign: "center" }}>
        {isSignUp ? "Already have an account?" : "No account?"}{" "}
        <span
          style={{ color: "#4caf50", cursor: "pointer", fontWeight: "bold" }}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Login here" : "Sign up here"}
        </span>
      </p>
    </div>
  );
}

export default Login;
