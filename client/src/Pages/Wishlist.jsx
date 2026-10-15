import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWishlist, notifyWishlistUpdated, removeWishlistProduct } from '../axiosCalls/wishlistApi.js'
import WishlistNavLink from '../components/WishlistNavLink.jsx'
import CartNavLink from '../components/CartNavLink.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [removingId, setRemovingId] = useState('')

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchWishlist()
      setProducts(response.wishlist || [])
    } catch {
      setError('We couldn’t load your wishlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const handleRemove = async (productId) => {
    setRemovingId(productId)
    setActionError('')

    try {
      await removeWishlistProduct(productId)
      setProducts((currentProducts) => currentProducts.filter((product) => product._id !== productId))
      notifyWishlistUpdated()
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to remove this product. Please try again.')
    } finally {
      setRemovingId('')
    }
  }

  return (
    <main className="wishlist-page min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Wishlist navigation">
        <Link className="brand" to="/home" aria-label="Back to Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-link" to="/products">Catalogue</Link>
          <WishlistNavLink />
          <CartNavLink />
          <Link className="nav-link" to="/profile">Account</Link>
        </div>
      </nav>

      {/* Main Wishlist Content */}
      <section className="wishlist-content max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="home-heading mb-8">
          <h1>
            Your wishlist
          </h1>
          <p className="text-[#56607A] text-base">
            {products.length} saved {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {loading && (
          <div className="wishlist-state">
            <div className="w-8 h-8 border-2 border-[#2340E6] border-t-transparent rounded-full animate-spin" />
            <span>Loading your wishlist...</span>
          </div>
        )}

        {!loading && error && (
          <div className="wishlist-state wishlist-state-error" role="alert">
            <p className="font-bold">{error}</p>
            <button className="button button-accent mt-2" type="button" onClick={loadWishlist}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="wishlist-empty p-12 text-center rounded-2xl bg-white border border-[#DDE1EA] max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-[#0F1B3D] mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-[#56607A] text-sm mb-6 max-w-md mx-auto">
              Tap the heart on any product to save it here.
            </p>
            <Link className="button button-accent" to="/products">
              Browse products
            </Link>
          </div>
        )}

        {!loading && !error && actionError && (
          <p className="p-3 mb-6 rounded-lg bg-[#C2331F]/10 border border-[#C2331F]/30 text-[#C2331F] text-xs tabular-nums" role="alert">
            ! {actionError}
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="wishlist-grid">
            {products.map((product) => (
              <article className="wishlist-card" key={product._id}>
                <Link className="wishlist-image-wrap block relative overflow-hidden bg-[#E3E8F2]" to={`/products/${product._id}`}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  <span className="absolute top-3 left-3 bg-white text-[#0F1B3D] text-xs font-semibold px-2 py-0.5 rounded shadow-sm">
                    {product.category}
                  </span>
                </Link>

                <div className="wishlist-card-content flex flex-col justify-between p-5 flex-1">
                  <div>
                    <p className="catalog-product-category">{product.category}</p>
                    <Link to={`/products/${product._id}`} className="hover:text-[#2340E6] transition-colors">
                      <h2 className="text-lg font-bold text-[#0F1B3D] mb-2">{product.name}</h2>
                    </Link>
                    
                    <div className="catalog-product-footer pt-3 border-t border-[#DDE1EA] flex items-baseline justify-between">
                      <strong className="text-[#2340E6] tabular-nums text-base">{formatPrice(product.price)}</strong>
                      <span className="text-xs tabular-nums text-[#56607A]">
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link className="button button-accent !py-2.5 !text-xs text-center" to={`/products/${product._id}`}>
                      View product
                    </Link>
                    <button
                      className="wishlist-action wishlist-remove !mt-0 !py-2 !text-xs"
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                    >
                      {removingId === product._id ? 'Removing...' : 'Remove from Wishlist'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Wishlist