import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API_URL from "../api";

function CustomerLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const signupSuccess = location.state?.signupSuccess || "";

  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (token) {
      navigate("/products", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_URL}/api/customers/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));

      navigate("/products");
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(error.message || "Unable to login. Please try again.");

      setIsLoggingIn(false);
    }
  };

  return (
    <main className="customer-auth-page">
      <div className="customer-auth-card">
        <div className="customer-auth-header">
          <p className="customer-auth-label">LOCALPICK</p>

          <h1>Welcome back</h1>

          <p>Sign in to book products and keep track of your bookings.</p>
        </div>

        <form className="customer-auth-form" onSubmit={handleLogin}>
          <div className="customer-input-group">
            <label htmlFor="customer-login-phone">Mobile Number</label>

            <input
              id="customer-login-phone"
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
            <label htmlFor="customer-login-password">Password</label>

            <input
              id="customer-login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {signupSuccess && (
            <p className="customer-auth-success">{signupSuccess}</p>
          )}

          {loginError && <p className="customer-auth-error">{loginError}</p>}

          <button
            type="submit"
            className="customer-auth-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="customer-auth-footer">
          Don't have an account? <Link to="/customer/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}

export default CustomerLogin;
