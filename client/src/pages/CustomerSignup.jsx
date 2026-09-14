import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CustomerSignup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [signupError, setSignupError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    setSignupError("");
    setIsSigningUp(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/customers/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed.");
      }

      navigate("/customer/login", {
        state: {
          signupSuccess:
            "Account created successfully. Please sign in to continue.",
        },
      });
    } catch (error) {
      console.error("Signup error:", error);

      setSignupError(
        error.message || "Unable to create account. Please try again.",
      );

      setIsSigningUp(false);
    }
  };

  return (
    <main className="customer-auth-page">
      <div className="customer-auth-card">
        <div className="customer-auth-header">
          <p className="customer-auth-label">LOCALPICK</p>

          <h1>Create your account</h1>

          <p>
            Create an account to book products and keep track of your bookings.
          </p>
        </div>

        <form className="customer-auth-form" onSubmit={handleSignup}>
          <div className="customer-input-group">
            <label htmlFor="customer-name">Name</label>

            <input
              id="customer-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                setName(value);
              }}
              maxLength="50"
              autoComplete="name"
              required
            />
          </div>

          <div className="customer-input-group">
            <label htmlFor="customer-phone">Mobile Number</label>

            <input
              id="customer-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                setPhone(value.slice(0, 10));
              }}
              pattern="[6-9][0-9]{9}"
              maxLength="10"
              autoComplete="tel"
              required
            />
          </div>

          <div className="customer-input-group">
            <label htmlFor="customer-password">Password</label>

            <input
              id="customer-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              autoComplete="new-password"
              required
            />
          </div>

          {signupError && <p className="customer-auth-error">{signupError}</p>}

          <button
            type="submit"
            className="customer-auth-button"
            disabled={isSigningUp}
          >
            {isSigningUp ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="customer-auth-footer">
          Already have an account? <Link to="/customer/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default CustomerSignup;
