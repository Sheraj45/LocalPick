import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">LOCAL • SIMPLE • CONVENIENT</p>

          <h1>
            Find what you need.
            <br />
            Book it locally.
          </h1>

          <p className="hero-description">
            Browse our available products, check prices and details, and book
            what you need without calling or messaging.
          </p>

          <Link to="/products" className="hero-button">
            Browse Products
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <div className="how-it-works-container">
          <div className="how-it-works-header">
            <p className="page-label">HOW IT WORKS</p>

            <h2>Simple from start to finish.</h2>

            <p>
              Find a product, book it in seconds, and pick it up from our shop.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>

              <h3>Browse</h3>

              <p>
                Explore the products currently available and check their details
                and prices.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>

              <h3>Book</h3>

              <p>
                Choose what you need and book it using just your name and phone
                number.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>

              <h3>Pick Up</h3>

              <p>We'll prepare your product at the shop for you to collect.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
