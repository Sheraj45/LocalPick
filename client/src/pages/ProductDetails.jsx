import { useEffect, useState } from "react";
import { getCart } from "../cart";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API_URL from "../api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [cartQuantity, setCartQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setProductError("");

      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch product.");
        }

        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setProductError(error.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !product.available) {
      return;
    }

    const cart = getCart();

    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += cartQuantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        capacity: product.capacity,
        image: product.image,
        quantity: cartQuantity,
      });
    }

    localStorage.setItem("localPickCart", JSON.stringify(cart));

    setCartMessage(`${product.name} × ${cartQuantity} added to cart.`);

    setCartQuantity(1);

    setTimeout(() => {
      setCartMessage("");
    }, 2500);
  };

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (productError || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-info">
            <h1>Product not found</h1>

            <p>{productError || "This product could not be loaded."}</p>
          </div>
        </div>
      </main>
    );
  }

  const handleBooking = async (e) => {
    e.preventDefault();

    setBookingError("");

    if (isBooking) {
      return;
    }

    if (!product || !product.available) {
      return;
    }

    const customerToken = localStorage.getItem("customerToken");

    if (!customerToken) {
      navigate("/customer/login", {
        state: {
          bookingProductId: product._id,
          returnTo: location.pathname,
        },
      });

      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          items: [
            {
              productId: product._id,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setBookingConfirmed(true);
    } catch (error) {
      console.error("Booking error:", error);

      setBookingError(
        error.message || "Failed to create booking. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <div className="product-details-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span>No Image</span>
          )}
        </div>

        <div className="product-details-info">
          <p className="page-label">{product.category}</p>

          <h1>{product.name}</h1>

          <p className="details-description">
            {product.description ||
              "No description available for this product."}
          </p>

          <div className="details-price">₹{product.price}</div>

          <p className="details-capacity">Size: {product.capacity}</p>

          <p className="details-availability">
            {product.available
              ? "✓ Currently available"
              : "Currently unavailable"}
          </p>

          {product.available && (
            <div className="add-to-cart-section">
              <h2>Add to Cart</h2>

              <div className="cart-quantity-row">
                <button
                  type="button"
                  onClick={() =>
                    setCartQuantity((quantity) => Math.max(1, quantity - 1))
                  }
                >
                  −
                </button>

                <span>{cartQuantity}</span>

                <button
                  type="button"
                  onClick={() => setCartQuantity((quantity) => quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="add-to-cart-button"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              {cartMessage && (
                <p className="cart-success-message">✓ {cartMessage}</p>
              )}
            </div>
          )}

          {bookingConfirmed && (
            <div className="booking-success">
              <h2>Booking Confirmed ✓</h2>

              <p>Your booking has been received successfully.</p>

              <div className="booking-success-details">
                <div>
                  <span>Product</span>
                  <strong>{product.name}</strong>
                </div>

                <div>
                  <span>Price</span>
                  <strong>₹{product.price}</strong>
                </div>

                <div>
                  <span>Size</span>
                  <strong>{product.capacity}</strong>
                </div>
              </div>

              <p className="booking-success-note">
                Your product will be prepared at the shop for pickup.
              </p>
            </div>
          )}

          {!bookingConfirmed && product.available && (
            <form onSubmit={handleBooking} className="booking-form">
              <h2>Book This Product</h2>

              <p className="booking-login-note">
                Sign in to your LocalPick account to book this product.
              </p>

              {bookingError && <p className="booking-error">{bookingError}</p>}

              <button type="submit" disabled={isBooking}>
                {isBooking ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          )}

          {!product.available && (
            <div className="booking-form">
              <h2>Currently Unavailable</h2>

              <p className="booking-login-note">
                This product is currently unavailable for booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
