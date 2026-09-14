import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_URL from "../api";

function CustomerBookings() {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerData = async () => {
      const customerToken = localStorage.getItem("customerToken");

      if (!customerToken) {
        setBookingError("Please sign in to view your account.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${customerToken}`,
        };

        const [customerResponse, ordersResponse] = await Promise.all([
          fetch(`${API_URL}/api/customers/me`, {
            headers,
          }),
          fetch(`${API_URL}/api/bookings/orders/my`, {
            headers,
          }),
        ]);

        const customerData = await customerResponse.json();
        const ordersData = await ordersResponse.json();

        if (!customerResponse.ok) {
          throw new Error(
            customerData.message || "Failed to fetch customer details.",
          );
        }

        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.message || "Failed to fetch your bookings.",
          );
        }

        setCustomer(customerData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Customer dashboard fetch error:", error);

        setBookingError(
          error.message || "Unable to load your account. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "-");
  };

  if (loading) {
    return (
      <main className="customer-bookings-page">
        <div className="customer-bookings-container">
          <div className="customer-bookings-loading">
            <p>Loading your account...</p>
          </div>
        </div>
      </main>
    );
  }

  if (bookingError) {
    return (
      <main className="customer-bookings-page">
        <div className="customer-bookings-container">
          <div className="customer-bookings-header">
            <p className="page-label">YOUR ACCOUNT</p>

            <h1>My Bookings</h1>

            <p>View your account details and check your booking status.</p>
          </div>

          <div className="customer-bookings-error">
            <h2>Unable to load your account</h2>

            <p>{bookingError}</p>

            {!localStorage.getItem("customerToken") && (
              <button
                type="button"
                onClick={() =>
                  navigate("/customer/login", {
                    state: {
                      returnTo: "/customer/bookings",
                    },
                  })
                }
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-bookings-page">
      <div className="customer-bookings-container">
        <div className="customer-bookings-header">
          <p className="page-label">YOUR ACCOUNT</p>

          <p>View your account details and check your booking status.</p>
        </div>

        {location.state?.bookingSuccess && (
          <div className="customer-booking-success-message">
            ✓ {location.state.bookingSuccess}
          </div>
        )}

        {/* CUSTOMER DETAILS */}
        {customer && (
          <div className="customer-profile-card">
            <div className="customer-profile-icon">
              <svg
                width="24"
                height="24"
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
            </div>

            <div className="customer-profile-info">
              <div>
                <span>Name</span>
                <strong>{customer.name}</strong>
              </div>

              <div>
                <span>Phone Number</span>
                <strong>{customer.phone}</strong>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        <div className="customer-bookings-section">
          <div className="customer-bookings-section-header">
            <h2>My Bookings</h2>

            {orders.length > 0 && (
              <span>
                {orders.length} {orders.length === 1 ? "booking" : "bookings"}
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="customer-bookings-empty">
              <div className="customer-bookings-empty-icon">🛍</div>

              <h2>No bookings yet</h2>

              <p>Products you book will appear here.</p>

              <Link to="/products" className="customer-bookings-shop-button">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="customer-bookings-list">
              {orders.map((order) => (
                <div key={order._id} className="customer-booking-card">
                  <div className="customer-booking-top">
                    <div>
                      <p className="customer-booking-label">BOOKING</p>

                      <p className="customer-booking-id">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                    </div>

                    <span
                      className={`booking-status ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="customer-booking-items">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="customer-booking-item"
                      >
                        <div className="customer-booking-item-info">
                          <h3>{item.productName}</h3>

                          <p>
                            Size: {item.capacity} · Qty: {item.quantity}
                          </p>
                        </div>

                        <strong>₹{item.price * item.quantity}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="customer-booking-total">
                    <span>Total</span>

                    <strong>₹{order.totalAmount}</strong>
                  </div>

                  <div className="customer-booking-footer">
                    <div>
                      <span>Booked on</span>

                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>

                    <div>
                      <span>Time</span>

                      <strong>{formatTime(order.createdAt)}</strong>
                    </div>
                  </div>

                  <div className="customer-booking-note">
                    Your booking will be prepared at the shop for pickup.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default CustomerBookings;
