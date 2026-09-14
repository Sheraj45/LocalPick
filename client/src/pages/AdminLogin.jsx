import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("adminToken", data.token);

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(error.message || "Unable to login. Please try again.");

      setIsLoggingIn(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <p className="admin-login-label">LOCALPICK ADMIN</p>

          <h1>Welcome back</h1>

          <p>Sign in to manage products and bookings.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {loginError && <p className="admin-login-error">{loginError}</p>}

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
