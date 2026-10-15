import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct } from '../axiosCalls/productApi.js'
import WishlistNavLink from '../components/WishlistNavLink.jsx'
import CartNavLink from '../components/CartNavLink.jsx'
import { useCart } from '../context/CartContext.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [actionError, setActionError] = useState('')
  const { addToCart, cartItems } = useCart()

  useEffect(() => {
    let mounted = true
    const loadProduct = async () => {
      try {
        setLoading(true)
        const result = await fetchProduct(id)
        if (mounted) setProduct(result)
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.response?.status === 404
              ? 'Product not found.'
              : 'Something went wrong while loading this product.'
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      mounted = false
    }
  }, [id])

  const cartQuantity = cartItems.find((item) => item.product?._id === product?._id)?.quantity || 0

  const handleAddToCart = async () => {
    if (!product || adding) return

    setActionError('')
    setAdding(true)
    try {
      await addToCart(product._id)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to add this product to your cart.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center tabular-nums text-[#56607A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2340E6] border-t-transparent rounded-full animate-spin" />
          <span>Loading product...</span>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-white border border-[#C2331F]/30">
          <p className="text-[#C2331F] font-bold text-lg mb-4">{error}</p>
          <Link className="button button-dark" to="/products">
            ← Return to Catalogue
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="catalog-page min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Product navigation">
        <Link className="brand" to="/home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <WishlistNavLink />
          <CartNavLink />
          <Link className="nav-link" to="/products">
            ← Catalogue
          </Link>
        </div>
      </nav>

      {/* Main Details Section */}
      <section className="product-detail-content max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <Link className="text-xs tabular-nums font-bold text-[#56607A] hover:text-[#2340E6] inline-flex items-center gap-2 mb-8 transition-colors" to="/products">
          <span>←</span> Back to catalogue
        </Link>

        <div className="product-detail-layout">
          {/* Left: Dominant Product Imagery Stage */}
          <div className="product-detail-image relative group overflow-hidden bg-[#E3E8F2]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right: Sticky Intelligence & Action Panel */}
          <div className="product-detail-copy flex flex-col justify-center">
            <p className="text-sm text-[#56607A] mb-2">{product.category}</p>

            <h1 className="text-[#0F1B3D] font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <p className="product-detail-price text-3xl sm:text-4xl tabular-nums font-bold text-[#2340E6]">
                {formatPrice(product.price)}
              </p>
              <span className="text-xs tabular-nums text-[#56607A]">Inclusive of all taxes</span>
            </div>

            <div className="my-6 py-6 border-y border-[#DDE1EA]">
              <p className="text-[#56607A] text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Inventory Status Pill */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 text-xs tabular-nums font-bold px-3 py-1 rounded-full ${
                product.stock > 0 
                  ? 'bg-[#0B7A4B]/10 border border-[#0B7A4B]/30 text-[#0B7A4B]' 
                  : 'bg-[#C2331F]/10 border border-[#C2331F]/30 text-[#C2331F]'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col gap-3">
              <button
                className="button button-accent !py-4 !text-base font-bold w-full"
                type="button"
                disabled={product.stock === 0 || adding}
                onClick={handleAddToCart}
              >
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : cartQuantity > 0 ? (
                  `Add another (${cartQuantity} in cart)`
                ) : (
                  'Add to cart'
                )}
              </button>

              <div className="flex items-center gap-3">
                <Link className="button button-dark flex-1 text-center" to="/cart">
                  View cart
                </Link>
                <Link className="button button-dark flex-1 text-center" to="/products">
                  Continue browsing
                </Link>
              </div>
            </div>

            {actionError && (
              <p className="mt-4 p-3 rounded-lg bg-[#C2331F]/10 border border-[#C2331F]/30 text-[#C2331F] text-xs tabular-nums" role="alert">
                ! {actionError}
              </p>
            )}

            {/* Assurance Guarantees */}
            <div className="mt-8 pt-6 border-t border-[#DDE1EA] grid grid-cols-2 gap-4 text-xs tabular-nums text-[#56607A]">
              <div className="flex items-center gap-2">
                <span>Fast domestic delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Genuine products</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProductDetails