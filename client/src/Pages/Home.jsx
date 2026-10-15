import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import WishlistNavLink from '../components/WishlistNavLink.jsx'
import CartNavLink from '../components/CartNavLink.jsx'

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'N'
  const firstName = user?.fullName?.split(' ')[0] || 'Shopper'

  return (
    <main className="home-page min-h-screen">
      <nav className="site-nav" aria-label="Account navigation">
        <Link className="brand" to="/home" aria-label="Shoopify dashboard">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>

        <div className="market-search" role="search">
          <span aria-hidden="true">⌕</span>
          <span>Search products, brands and orders</span>
        </div>

        <div className="nav-actions">
          <Link className="nav-link" to="/products">Catalogue</Link>
          <WishlistNavLink />
          <CartNavLink />
          <Link className="nav-link" to="/orders">Orders</Link>
          <Link className="nav-link" to="/profile">Account</Link>
          <button className="nav-link logout-button" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <section className="home-content">
        <div className="home-heading">
          <h1>Welcome back, {firstName}</h1>
          <p className="text-[#56607A]">
            Pick up where you left off: browse the catalogue, check your wishlist or see your orders.
          </p>
        </div>

        <div className="shop-discovery-banner">
          <div className="relative z-10 max-w-xl">
            <h2>Browse the full catalogue</h2>
            <p>Filter by category and price, and see what is in stock before you buy.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link className="button button-accent" to="/products">Browse catalogue</Link>
              <Link className="button button-dark" to="/orders">View orders</Link>
            </div>
          </div>
          <div className="banner-picks hidden lg:flex">
            <p>Featured</p>
            <Link to="/products" className="banner-pick">
              <img
                src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=200&q=80"
                alt="Mechanical keyboard"
              />
              <div>
                <strong>Mechanical keyboard</strong>
                <span>₹3,499</span>
              </div>
            </Link>
            <Link to="/products" className="banner-pick">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80"
                alt="Smart fitness watch"
              />
              <div>
                <strong>Smart fitness watch</strong>
                <span>₹4,299</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="account-grid shop-account-grid">
          <article className="account-card">
            <div className="card-label">Your profile</div>
            <Link className="profile-row group" to="/profile">
              <span className="profile-avatar">{userInitial}</span>
              <div>
                <h2 className="group-hover:text-[#2340E6] transition-colors">{user?.fullName || 'Shoopify Customer'}</h2>
                <p>{user?.email || 'No email provided'}</p>
              </div>
            </Link>
            <div className="card-detail">
              <span>Phone</span>
              <strong>{user?.phone || 'Not provided'}</strong>
            </div>
          </article>

          <article className="account-card account-card-secondary">
            <div className="card-label">Orders</div>
            <div className="status-icon" aria-hidden="true">↗</div>
            <h2>Track your orders</h2>
            <p>Check the status of past orders and see what you paid.</p>
            <Link className="mt-6 inline-flex text-sm font-semibold text-[#2340E6] hover:underline" to="/orders">
              Go to my orders
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Home
