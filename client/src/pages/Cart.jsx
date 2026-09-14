import { useState } from "react";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../cart";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState(() => getCart());
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();

  const handleQuantityChange = (productId, quantity) => {
    const updatedCart = updateCartQuantity(productId, quantity);

    setCart(updatedCart);
  };

  const handleRemove = (productId) => {
    const updatedCart = removeFromCart(productId);

    setCart(updatedCart);
  };

  const handleBookNow = async () => {
    setBookingError("");

    if (cart.length === 0) {
      setBookingError("Your cart is empty.");
      return;
    }

    const customerToken = localStorage.getItem("customerToken");

    if (!customerToken) {
      navigate("/customer/login", {
        state: {
          bookingRedirect: true,
        },
      });

      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking.");
      }

      clearCart();

      setCart([]);

      navigate("/customer/bookings", {
        state: {
          bookingSuccess: "Your booking has been placed successfully.",
        },
      });
    } catch (error) {
      console.error("Booking error:", error);

      setBookingError(
        error.message || "Unable to place your booking. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <p className="page-label">YOUR SELECTION</p>

          <h1>Your Cart</h1>

          <p>Review the products you've selected before booking.</p>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>

            <p>Add products to your cart and they will appear here.</p>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>No Image</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <p className="cart-item-category">PRODUCT</p>

                    <h2>{item.name}</h2>

                    <p className="cart-item-capacity">Size: {item.capacity}</p>

                    <p className="cart-item-price">₹{item.price} each</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity - 1,
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity + 1,
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <strong className="cart-item-total">
                      ₹{item.price * item.quantity}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => handleRemove(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items</span>

                <strong>{totalItems}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Total</span>

                <strong>₹{totalPrice}</strong>
              </div>

              {bookingError && (
                <p className="cart-booking-error">{bookingError}</p>
              )}

              <button
                type="button"
                className="cart-book-button"
                onClick={handleBookNow}
                disabled={isBooking}
              >
                {isBooking ? "Booking..." : "Book Now"}
              </button>

              <p className="cart-summary-note">
                You'll confirm your booking before it is submitted.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
