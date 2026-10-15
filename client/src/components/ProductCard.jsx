import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { addWishlistProduct, notifyWishlistUpdated, removeWishlistProduct } from '../axiosCalls/wishlistApi.js'
import { useCart } from '../context/CartContext.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function ProductCard({ product, isWishlisted = false, onWishlistChange }) {
  const [saved, setSaved] = useState(isWishlisted)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [cartError, setCartError] = useState('')
  const { addToCart, cartItems } = useCart()

  useEffect(() => {
    setSaved(isWishlisted)
  }, [isWishlisted])

  const cartQuantity = cartItems.find((item) => item.product?._id === product._id)?.quantity || 0

  const handleWishlistClick = async () => {
    if (saving) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      if (saved) {
        await removeWishlistProduct(product._id)
        setSaved(false)
        onWishlistChange?.(product._id, false)
        setMessage('Removed from your wishlist.')
      } else {
        await addWishlistProduct(product._id)
        setSaved(true)
        onWishlistChange?.(product._id, true)
        setMessage('Added to your wishlist.')
      }
      notifyWishlistUpdated()
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setSaved(true)
        onWishlistChange?.(product._id, true)
        setError('This product is already in your wishlist.')
        notifyWishlistUpdated()
      } else {
        setError(requestError.response?.data?.message || 'Unable to update your wishlist. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddToCart = async () => {
    if (adding) return

    setCartError('')
    setAdding(true)
    try {
      await addToCart(product._id)
    } catch (requestError) {
      setCartError(requestError.response?.data?.message || 'Unable to add this product to your cart.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="catalog-product-card group">
      <Link to={`/products/${product._id}`} className="catalog-product-image-wrap">
        <img src={product.image} alt={product.name} className="catalog-product-image" loading="lazy" />
        {product.stock <= 3 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-[#C2331F] text-[#0F1B3D] text-xs px-2 py-0.5 rounded font-semibold">
            Only {product.stock} left
          </span>
        )}
      </Link>
      <div className="catalog-product-meta">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="catalog-product-category !mb-0">{product.category}</p>
          <span className={`text-xs tabular-nums ${product.stock > 0 ? 'text-[#0B7A4B]' : 'text-[#C2331F]'}`}>
            {product.stock > 0 ? `● ${product.stock} in stock` : '○ Out of stock'}
          </span>
        </div>

        <Link to={`/products/${product._id}`} className="hover:text-[#2340E6] transition-colors">
          <h2>{product.name}</h2>
        </Link>
        <p className="catalog-product-description">{product.description}</p>
        
        <div className="catalog-product-footer">
          <div>
            <strong>{formatPrice(product.price)}</strong>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <button 
            className="button button-accent catalog-details-button !mt-0" 
            type="button" 
            onClick={handleAddToCart} 
            disabled={product.stock === 0 || adding}
          >
            {adding ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Adding...
              </span>
            ) : cartQuantity > 0 ? (
              `Add another (${cartQuantity})`
            ) : (
              'Add to cart'
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link className="button button-dark !py-2 !text-xs !mt-0 text-center" to={`/products/${product._id}`}>
              Details
            </Link>
            <button 
              className={`wishlist-action !mt-0 !py-2 !text-xs ${saved ? 'wishlist-action-saved' : ''}`} 
              type="button" 
              onClick={handleWishlistClick} 
              disabled={saving} 
              aria-pressed={saved}
            >
              {saving ? '...' : saved ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>
        </div>

        {message && <p className="wishlist-feedback" role="status">✓ {message}</p>}
        {error && <p className="wishlist-feedback wishlist-feedback-error" role="alert">! {error}</p>}
        {cartError && <p className="wishlist-feedback wishlist-feedback-error" role="alert">! {cartError}</p>}
      </div>
    </article>
  )
}

export default ProductCard