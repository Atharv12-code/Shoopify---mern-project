import { Link } from 'react-router-dom'

const categories = [
  { title: 'Electronics', note: 'Latest tech', color: '#2340E6' },
  { title: 'Fashion', note: 'Street and formal', color: '#FFB81C' },
  { title: 'Home and living', note: 'Modern spaces', color: '#0F1B3D' },
  { title: 'Beauty and care', note: 'Daily essentials', color: '#C2331F' },
]

const promises = [
  {
    title: 'Fast doorstep delivery',
    text: 'Orders are dispatched from domestic fulfilment hubs.',
    icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  },
  {
    title: 'Secure payments with Razorpay',
    text: 'Pay by card, UPI or netbanking with encrypted checkout.',
    icon: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4',
  },
  {
    title: '30-day returns',
    text: 'Straightforward returns with direct customer support.',
    icon: 'M4 12a8 8 0 108-8M4 4v5h5',
  },
]

function Landing() {
  return (
    <main className="landing-page min-h-screen">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>

        <div className="market-search" role="search">
          <span aria-hidden="true">⌕</span>
          <span>Search electronics, fashion, books and more</span>
        </div>

        <div className="nav-actions">
          <Link className="nav-link" to="/login">Cart</Link>
          <Link className="nav-link" to="/login">Log in</Link>
          <Link className="button button-accent !py-2.5 !px-5" to="/signup">Sign up</Link>
        </div>
      </nav>

      <div className="category-bar" aria-label="Shop categories">
        <span>All categories</span>
        <span>Electronics</span>
        <span>Fashion</span>
        <span>Books</span>
        <span>Home</span>
        <span>Beauty</span>
        <span>Grocery</span>
        <span>New arrivals</span>
      </div>

      <section className="landing-hero">
        <div className="hero-copy">
          <h1>Shop electronics, fashion, books and more.</h1>
          <p className="hero-description">
            Browse the full catalogue, save products to your wishlist and pay securely with UPI, cards or netbanking.
          </p>
          <div className="hero-actions flex-wrap">
            <Link className="button button-accent !py-3.5 !px-7" to="/signup">Create an account</Link>
            <Link className="button button-dark !py-3.5 !px-6" to="/login">Log in to track an order</Link>
          </div>
        </div>

        <div className="hero-panel" aria-label="Featured product">
          <div className="product-art product-art-large">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
              alt="Noise cancelling wireless headphones"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="product-hero-info">
            <div>
              <p>Noise cancelling wireless headphones</p>
              <span className="price-tag">₹6,999</span>
            </div>
            <Link to="/signup" className="round-arrow" aria-label="View featured product">↗</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-8 pb-14 max-md:px-[18px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">Shop by category</h2>
          <Link to="/signup" className="text-sm font-semibold text-[#2340E6] hover:underline">View all categories</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.title} to="/signup" className="category-tile">
              <span className="swatch" style={{ background: cat.color }} aria-hidden="true" />
              <div>
                <h3>{cat.title}</h3>
                <p>{cat.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shop-feature-row">
        {promises.map((item) => (
          <div key={item.title}>
            <span aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            </span>
            <div>
              <p>{item.title}</p>
              <p className="!mt-1 !text-sm !font-normal !text-[#56607A]">{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="site-footer">
        <div className="flex items-center gap-3">
          <strong className="font-display text-lg text-[#0F1B3D]">Shoopify</strong>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Create account</Link>
        </div>
      </footer>
    </main>
  )
}

export default Landing
