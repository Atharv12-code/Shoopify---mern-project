import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function Cart() {
  const { cartItems, cartLoading, cartError, subtotal, updateQuantity, removeFromCart, refreshCart } = useCart()
  const [updatingId, setUpdatingId] = useState('')

  const handleQuantityChange = async (productId, nextQuantity) => {
    if (!productId || nextQuantity < 1) return
    setUpdatingId(productId)
    try {
      await updateQuantity(productId, nextQuantity)
    } finally {
      setUpdatingId('')
    }
  }

  const handleRemove = async (productId) => {
    setUpdatingId(productId)
    try {
      await removeFromCart(productId)
    } finally {
      setUpdatingId('')
    }
  }

  const itemCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0)

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center tabular-nums text-[#56607A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2340E6] border-t-transparent rounded-full animate-spin" />
          <span>Loading your cart...</span>
        </div>
      </main>
    )
  }

  if (cartError) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-white border border-[#C2331F]/30">
          <p className="text-[#C2331F] font-bold text-lg mb-4">{cartError}</p>
          <button type="button" className="button button-accent" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Cart navigation">
        <Link className="brand" to="/home" aria-label="Back to Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-link" to="/products">Catalogue</Link>
          <Link className="nav-link" to="/wishlist">Wishlist</Link>
          <Link className="nav-link" to="/orders">Orders</Link>
          <Link className="nav-link" to="/profile">Account</Link>
        </div>
      </nav>

      {/* Main Cart Content */}
      <section className="cart-content max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="home-heading mb-8">
          <h1>
            Your cart
          </h1>
          <p className="text-[#56607A] text-base">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready to check out.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty p-12 text-center rounded-2xl bg-white border border-[#DDE1EA] max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-[#0F1B3D] mb-2">Your cart is empty</h2>
            <p className="text-[#56607A] text-sm mb-6 max-w-md mx-auto">
              You haven't added anything yet. Browse the catalogue to find something you like.
            </p>
            <Link className="button button-accent" to="/products">
              Browse the catalogue
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left Items Panel */}
            <section className="cart-items-panel">
              {cartItems.map((item) => {
                const product = item.product
                if (!product) return null

                const isUpdating = updatingId === product._id
                const lineTotal = Number(product.price || 0) * Number(item.quantity || 0)

                return (
                  <article className="cart-item-card" key={product._id}>
                    <Link className="cart-image-wrap block relative overflow-hidden bg-[#E3E8F2]" to={`/products/${product._id}`}>
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </Link>

                    <div className="cart-item-details">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs tabular-nums text-[#2340E6] ">
                            {product.category}
                          </span>
                          <span className="text-xs tabular-nums text-[#56607A]">
                            Unit: {formatPrice(product.price)}
                          </span>
                        </div>
                        <Link to={`/products/${product._id}`} className="hover:text-[#2340E6] transition-colors">
                          <h2 className="mt-1">{product.name}</h2>
                        </Link>
                      </div>

                      <div className="cart-item-controls pt-2">
                        {/* Tactile Quantity Stepper */}
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product._id, Number(item.quantity) - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            aria-label={`Decrease quantity of ${product.name}`}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product._id, Number(item.quantity) + 1)}
                            disabled={isUpdating || item.quantity >= (product.stock || 0)}
                            aria-label={`Increase quantity of ${product.name}`}
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          className="text-xs tabular-nums font-semibold text-[#C2331F] hover:text-[#9E2616] transition-colors flex items-center gap-1 disabled:opacity-50"
                          onClick={() => handleRemove(product._id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : 'Remove'}
                        </button>
                      </div>

                      <div className="cart-price-row">
                        <span className="text-xs text-[#56607A] tabular-nums">Item total</span>
                        <strong>{formatPrice(lineTotal)}</strong>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            {/* Right Sticky Order Summary Card */}
            <aside className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items</span>
                <strong>{itemCount}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong className="text-[#0B7A4B]">Free</strong>
              </div>
              <div className="summary-row">
                <span className="text-base font-bold text-[#0F1B3D]">Subtotal</span>
                <strong className="text-xl text-[#2340E6] tabular-nums font-bold">
                  {formatPrice(subtotal)}
                </strong>
              </div>

              <Link className="button button-accent cart-checkout-button" to="/checkout">
                Proceed to Checkout
              </Link>

              <div className="mt-6 pt-6 border-t border-[#DDE1EA] text-xs tabular-nums text-[#56607A] flex flex-col gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-[#2340E6]">✓</span> Powered by Razorpay Standard Checkout
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[#2340E6]">✓</span> Payments are encrypted
                </span>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

export default Cart
