import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
      });
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <main className="products-page">
      <div className="products-container">
        <div className="products-header">
          <p className="page-label">OUR PRODUCTS</p>

          <h1>Browse Products</h1>

          <p>Explore the products currently available at our shop.</p>

          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products found in this category.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Link
                to={`/products/${product._id}`}
                key={product._id}
                className="product-card"
              >
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>

                <div className="product-info">
                  <p className="product-category">{product.category}</p>

                  <h2>{product.name}</h2>

                  <p className="product-description">{product.description}</p>

                  {product.available ? (
                    <span className="availability available">Available</span>
                  ) : (
                    <span className="availability unavailable">
                      Currently unavailable
                    </span>
                  )}

                  <div className="product-bottom">
                    <span className="product-price">₹{product.price}</span>

                    <span className="product-capacity">{product.capacity}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Products;
