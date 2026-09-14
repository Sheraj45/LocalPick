import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import "./App.css";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerBookings from "./pages/CustomerBookings";
import Cart from "./pages/Cart";
import { getCartItemCount } from "./cart";

function Navbar() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => getCartItemCount());

  const customerLoggedIn = !!localStorage.getItem("customerToken");

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    window.addEventListener("localPickCartUpdated", updateCartCount);

    updateCartCount();

    return () => {
      window.removeEventListener("localPickCartUpdated", updateCartCount);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");

    setProfileOpen(false);
    closeMobileMenu();

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          LocalPick
        </Link>

        {/* Desktop + Mobile Right Controls */}
        <div className="navbar-actions">
          {/* Desktop Navigation */}
          <div className="nav-links">
            <Link to="/" onClick={closeMobileMenu}>
              Home
            </Link>

            <Link to="/products" onClick={closeMobileMenu}>
              Products
            </Link>

            <Link to="/admin/login" onClick={closeMobileMenu}>
              Admin
            </Link>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="cart-nav-link"
            aria-label={`Cart with ${cartCount} items`}
            onClick={closeMobileMenu}
          >
            <span className="cart-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 4H5L7.4 15.2C7.6 16.2 8.5 17 9.5 17H17.5C18.5 17 19.4 16.3 19.7 15.3L21 9H6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="10" cy="20" r="1.3" fill="currentColor" />

                <circle cx="18" cy="20" r="1.3" fill="currentColor" />
              </svg>

              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </span>
          </Link>

          {/* Customer Profile */}
          <div className="profile-menu">
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfileOpen((previous) => !previous)}
              aria-label="Customer profile"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M4 21C4.8 16.8 7.5 14 12 14C16.5 14 19.2 16.8 20 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {customerLoggedIn ? (
                  <>
                    <Link
                      to="/customer/bookings"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Bookings
                    </Link>

                    <button type="button" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/customer/login"
                      onClick={() => setProfileOpen(false)}
                    >
                      Sign In
                    </Link>

                    <Link
                      to="/customer/signup"
                      onClick={() => setProfileOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <Link to="/" onClick={closeMobileMenu}>
            Home
          </Link>

          <Link to="/products" onClick={closeMobileMenu}>
            Products
          </Link>

          <Link to="/admin/login" onClick={closeMobileMenu}>
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/:id" element={<ProductDetails />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/customer/signup" element={<CustomerSignup />} />

        <Route path="/customer/login" element={<CustomerLogin />} />

        <Route path="/customer/bookings" element={<CustomerBookings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
