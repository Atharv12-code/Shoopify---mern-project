import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axiosInstance.get('/orders')
      setOrders(response.data.orders || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return (
    <main className="min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Orders navigation">
        <Link className="brand" to="/home" aria-label="Back to Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-link" to="/products">Catalogue</Link>
          <Link className="nav-link" to="/cart">Cart</Link>
          <Link className="nav-link" to="/profile">Account</Link>
        </div>
      </nav>

      {/* Main Orders Content */}
      <section className="orders-content max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="home-heading mb-8">
          <h1>
            Your orders
          </h1>
          <p className="text-[#56607A] text-base">
            Review your past orders and their payment status.
          </p>
        </div>

        {loading && (
          <div className="orders-state">
            <div className="w-8 h-8 border-2 border-[#2340E6] border-t-transparent rounded-full animate-spin" />
            <span>Loading your orders...</span>
          </div>
        )}

        {!loading && error && (
          <div className="orders-state orders-state-error" role="alert">
            <p className="font-bold">{error}</p>
            <button className="button button-accent mt-2" type="button" onClick={loadOrders}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty p-12 text-center rounded-2xl bg-white border border-[#DDE1EA] max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-[#0F1B3D] mb-2">
              No orders placed yet
            </h2>
            <p className="text-[#56607A] text-sm mb-6 max-w-md mx-auto">
              When you place an order, it will show up here.
            </p>
            <Link className="button button-accent" to="/products">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const statusClass =
                order.status === 'PAID'
                  ? 'border-[#0B7A4B]/30 bg-[#0B7A4B]/10 text-[#0B7A4B]'
                  : order.status === 'PENDING_PAYMENT'
                  ? 'border-[#B25E00]/30 bg-[#B25E00]/10 text-[#B25E00]'
                  : 'border-[#2340E6]/30 bg-[#2340E6]/10 text-[#2340E6]'

              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card-heading flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow !text-xs !mb-1 text-[#56607A]">
                        Placed {formatDate(order.createdAt)}
                      </p>
                      <h2 className="tabular-nums text-lg font-bold text-[#0F1B3D]">
                        Order #{order._id}
                      </h2>
                    </div>
                    <span className={`order-status ${statusClass}`}>
                      ● {order.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="order-card-items">
                    {order.items.map((item, index) => (
                      <div className="flex items-center justify-between text-sm py-1" key={`${item.product}-${index}`}>
                        <span className="text-[#0F1B3D] font-medium">{item.name}</span>
                        <span className="text-[#56607A] tabular-nums">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDE1EA]">
                    <div className="flex items-center gap-6">
                      <span>
                        <span className="text-xs tabular-nums text-[#56607A] block">Total</span>
                        <strong className="text-[#2340E6] text-base tabular-nums">{formatPrice(order.totalAmount)}</strong>
                      </span>
                      <span>
                        <span className="text-xs tabular-nums text-[#56607A] block">Payment</span>
                        <strong className="text-[#0F1B3D] text-sm tabular-nums">{order.paymentStatus}</strong>
                      </span>
                    </div>

                    <Link className="button button-dark !py-2.5 !px-5 !text-xs" to={`/orders/${order._id}`}>
                      View Details
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Orders
