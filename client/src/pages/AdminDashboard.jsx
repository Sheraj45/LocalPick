import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookingSearch, setBookingSearch] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState("");

  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        message: "",
        type: "",
      });
    }, 3000);
  };

  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------

  const pendingBookings =
    bookings.filter((booking) => booking.status === "Pending").length +
    orders.filter((order) => order.status === "Pending").length;

  const readyBookings =
    bookings.filter((booking) => booking.status === "Ready").length +
    orders.filter((order) => order.status === "Ready").length;

  const completedBookings =
    bookings.filter((booking) => booking.status === "Completed").length +
    orders.filter((order) => order.status === "Completed").length;

  const cancelledBookings =
    bookings.filter((booking) => booking.status === "Cancelled").length +
    orders.filter((order) => order.status === "Cancelled").length;

  // --------------------------------------------------
  // PRODUCT FUNCTIONS
  // --------------------------------------------------

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("adminToken");

      const formData = new FormData();

      formData.append("name", productName);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("capacity", capacity);
      formData.append("description", description);
      formData.append("available", available);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      showNotification("Product added successfully!");

      setProductName("");
      setCategory("");
      setPrice("");
      setCapacity("");
      setImage(null);
      setDescription("");
      setAvailable(true);
      setShowProductForm(false);

      setProducts((currentProducts) => [...currentProducts, data]);
    } catch (error) {
      console.error("Add product error:", error);

      showNotification(error.message, "error");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("adminToken");

      const formData = new FormData();

      formData.append("name", productName);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("capacity", capacity);
      formData.append("description", description);
      formData.append("available", available);

      if (image && typeof image !== "string") {
        formData.append("image", image);
      }

      const response = await fetch(
        `${API_URL}/api/products/${editingProductId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const updatedProduct = await response.json();

      if (!response.ok) {
        throw new Error(updatedProduct.message || "Failed to update product");
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === editingProductId ? updatedProduct : product,
        ),
      );

      showNotification("Product updated successfully!");

      setEditingProductId(null);
      setProductName("");
      setCategory("");
      setPrice("");
      setCapacity("");
      setImage(null);
      setDescription("");
      setAvailable(true);
      setShowProductForm(false);
    } catch (error) {
      console.error("Edit product error:", error);

      showNotification(error.message, "error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId),
      );

      showNotification("Product deleted successfully!");
    } catch (error) {
      console.error("Delete product error:", error);

      showNotification(error.message, "error");
    }
  };

  const toggleProductAvailability = async (product) => {
    try {
      const token = localStorage.getItem("adminToken");

      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("category", product.category);
      formData.append("price", product.price);
      formData.append("capacity", product.capacity);
      formData.append("description", product.description || "");
      formData.append("available", !product.available);

      const response = await fetch(`${API_URL}/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const updatedProduct = await response.json();

      if (!response.ok) {
        throw new Error(
          updatedProduct.message || "Failed to update availability",
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct._id === product._id ? updatedProduct : currentProduct,
        ),
      );
    } catch (error) {
      console.error("Availability update error:", error);

      showNotification("Failed to update product availability.", "error");
    }
  };

  // --------------------------------------------------
  // BOOKING / ORDER STATUS FUNCTIONS
  // --------------------------------------------------

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      const updatedBooking = await response.json();

      if (!response.ok) {
        throw new Error(updatedBooking.message || "Failed to update booking");
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId ? updatedBooking : booking,
        ),
      );

      showNotification(`Booking status changed to ${status}.`, "info");
    } catch (error) {
      console.error("Booking status update error:", error);

      showNotification("Failed to update booking status.", "error");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/bookings/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const updatedOrder = await response.json();

      if (!response.ok) {
        throw new Error(updatedOrder.message || "Failed to update booking");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? updatedOrder : order,
        ),
      );

      showNotification(`Booking status changed to ${status}.`, "info");
    } catch (error) {
      console.error("Order status update error:", error);

      showNotification("Failed to update booking status.", "error");
    }
  };

  // --------------------------------------------------
  // AUTH CHECK
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    fetch(`${API_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setBookings(data);
      })
      .catch((error) => {
        console.error("Failed to fetch bookings:", error);
      });

    fetch(`${API_URL}/api/bookings/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        console.error("Failed to fetch orders:", error);
      });

    fetch(`${API_URL}/api/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
      });
  }, []);

  // --------------------------------------------------
  // UNIFIED BOOKINGS
  // --------------------------------------------------

  const unifiedBookings = [
    ...orders.map((order) => ({
      ...order,
      bookingType: "order",
      bookingId: order._id,
    })),

    ...bookings.map((booking) => ({
      ...booking,
      bookingType: "legacy",
      bookingId: booking._id,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredBookings = unifiedBookings.filter((booking) => {
    const search = bookingSearch.toLowerCase().trim();

    if (!search) {
      return true;
    }

    const customerMatch = booking.customerName?.toLowerCase().includes(search);

    const phoneMatch = booking.phone?.toLowerCase().includes(search);

    if (booking.bookingType === "order") {
      const productMatch = booking.items?.some((item) =>
        item.productName.toLowerCase().includes(search),
      );

      return customerMatch || phoneMatch || productMatch;
    }

    const productMatch = booking.productName?.toLowerCase().includes(search);

    return customerMatch || phoneMatch || productMatch;
  });

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="admin-page">
      {notification.message && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-container">
        {/* HEADER */}

        <div className="admin-header">
          <div>
            <p className="page-label">LOCALPICK ADMIN</p>

            <h1>Dashboard</h1>
          </div>

          <div className="admin-header-actions">
            <button
              className="add-product-button"
              onClick={() => {
                setEditingProductId(null);
                setProductName("");
                setCategory("");
                setPrice("");
                setCapacity("");
                setImage(null);
                setDescription("");
                setAvailable(true);
                setShowProductForm(true);
              }}
            >
              + Add Product
            </button>

            <button
              className="logout-button"
              onClick={() => {
                localStorage.removeItem("adminToken");

                window.location.href = "/admin/login";
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="booking-summary">
          <div className="summary-card summary-pending">
            <span>Pending</span>
            <strong>{pendingBookings}</strong>
          </div>

          <div className="summary-card summary-ready">
            <span>Ready</span>
            <strong>{readyBookings}</strong>
          </div>

          <div className="summary-card summary-completed">
            <span>Completed</span>
            <strong>{completedBookings}</strong>
          </div>

          <div className="summary-card summary-cancelled">
            <span>Cancelled</span>
            <strong>{cancelledBookings}</strong>
          </div>
        </div>

        {/* PRODUCT FORM */}

        {showProductForm && (
          <div className="product-form-container">
            <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>

            <form
              onSubmit={editingProductId ? handleEditProduct : handleAddProduct}
              className="product-form"
            >
              <input
                type="text"
                placeholder="Product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Capacity / Size"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0] || null)}
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label>
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                />
                Available
              </label>

              <div>
                <button type="submit">
                  {editingProductId ? "Update Product" : "Add Product"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProductId(null);
                    setImage(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PRODUCTS SECTION */}

        <div className="admin-section">
          <div className="section-header">
            <h2>Products</h2>

            <span>{products.length} products</span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products available.</p>
            </div>
          ) : (
            <div className="products-list">
              {products.map((product) => (
                <div className="admin-product-card" key={product._id}>
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="admin-product-image"
                    />
                  )}

                  <div>
                    <p className="booking-label">{product.category}</p>

                    <h3>{product.name}</h3>

                    <p>
                      ₹{product.price} • {product.capacity}
                    </p>
                  </div>

                  <div className="product-actions">
                    <button
                      type="button"
                      className={
                        product.available
                          ? "availability-button available"
                          : "availability-button unavailable"
                      }
                      onClick={() => toggleProductAvailability(product)}
                    >
                      {product.available ? "Available" : "Unavailable"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(product._id);

                        setProductName(product.name);

                        setCategory(product.category);

                        setPrice(product.price);

                        setCapacity(product.capacity);

                        setImage(product.image);

                        setDescription(product.description);

                        setAvailable(product.available);

                        setShowProductForm(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteProductId(product._id);

                        setDeleteProductName(product.name);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UNIFIED BOOKINGS SECTION */}

        <div className="admin-section">
          <div className="section-header">
            <h2>Bookings</h2>

            <input
              type="text"
              placeholder="Search by customer, phone or product..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="booking-search"
            />

            <span>
              {filteredBookings.length} shown / {unifiedBookings.length} total
            </span>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <p>
                {bookingSearch
                  ? "No matching bookings found."
                  : "No bookings found."}
              </p>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map((booking) => {
                const isOrder = booking.bookingType === "order";

                return (
                  <div
                    className="booking-card"
                    key={`${booking.bookingType}-${booking.bookingId}`}
                  >
                    {/* BOOKING HEADER */}

                    <div className="booking-main">
                      <div>
                        <p className="booking-label">CUSTOMER</p>

                        <h3>{booking.customerName}</h3>

                        <p className="booking-id">
                          Booking ID: {booking._id.slice(-6).toUpperCase()}
                        </p>
                      </div>

                      <span
                        className={`status status-${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* ORDER BOOKING */}

                    {isOrder ? (
                      <>
                        <div className="booking-details">
                          <div>
                            <span>Customer</span>

                            <strong className="booking-customer-name">
                              {booking.customerName}
                            </strong>
                          </div>

                          <div>
                            <span>Phone</span>

                            <a
                              href={`tel:${booking.phone}`}
                              className="booking-phone"
                            >
                              {booking.phone}
                            </a>
                          </div>

                          <div>
                            <span>Items</span>

                            <strong>
                              {booking.items.reduce(
                                (total, item) => total + item.quantity,
                                0,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Total</span>

                            <strong>₹{booking.totalAmount}</strong>
                          </div>

                          <div>
                            <span>Booked On</span>

                            <p>
                              {new Date(booking.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="order-items">
                          <p className="booking-label">BOOKING ITEMS</p>

                          {booking.items.map((item) => (
                            <div className="order-item" key={item.productId}>
                              <div>
                                <strong>{item.productName}</strong>

                                <span>
                                  {item.capacity} × {item.quantity}
                                </span>
                              </div>

                              <strong>₹{item.price * item.quantity}</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      /* LEGACY BOOKING */

                      <div className="booking-details">
                        <div>
                          <span>Customer</span>

                          <strong className="booking-customer-name">
                            {booking.customerName}
                          </strong>
                        </div>

                        <div>
                          <span>Phone</span>

                          <a
                            href={`tel:${booking.phone}`}
                            className="booking-phone"
                          >
                            {booking.phone}
                          </a>
                        </div>

                        <div>
                          <span>Product</span>

                          <strong>{booking.productName}</strong>
                        </div>

                        <div>
                          <span>Quantity</span>

                          <strong>{booking.quantity}</strong>
                        </div>

                        <div>
                          <span>Total</span>

                          <strong>₹{booking.price * booking.quantity}</strong>
                        </div>

                        <div>
                          <span>Booked On</span>

                          <p>
                            {new Date(booking.createdAt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* STATUS UPDATE */}

                    <div className="booking-action">
                      <label>Update Status</label>

                      <select
                        value={booking.status}
                        onChange={(e) => {
                          if (isOrder) {
                            updateOrderStatus(booking._id, e.target.value);
                          } else {
                            updateBookingStatus(booking._id, e.target.value);
                          }
                        }}
                        className={`status-select status-${booking.status.toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>

                        <option value="Ready">Ready</option>

                        <option value="Completed">Completed</option>

                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION */}

      {deleteProductId && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-box">
            <h2>Delete Product?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteProductName}</strong>?
            </p>

            <p className="delete-warning">This action cannot be undone.</p>

            <div className="delete-confirm-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={() => {
                  setDeleteProductId(null);
                  setDeleteProductName("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={async () => {
                  await handleDeleteProduct(deleteProductId);

                  setDeleteProductId(null);
                  setDeleteProductName("");
                }}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
