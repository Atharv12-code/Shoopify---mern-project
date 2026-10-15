import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadOrder = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${id}`)
        if (mounted) setOrder(response.data.order)
      } catch (requestError) {
        if (mounted) {
          setError(requestError.response?.data?.message || 'Unable to load this order.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadOrder()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center tabular-nums text-[#56607A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2340E6] border-t-transparent rounded-full animate-spin" />
          <span>Loading your order...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Order details navigation">
        <Link className="brand" to="/home" aria-label="Back to Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-link" to="/orders">← My Orders</Link>
          <Link className="nav-link" to="/products">Catalogue</Link>
        </div>
      </nav>

      {/* Main Order Details Content */}
      <section className="order-details-content max-w-4xl mx-auto px-6 sm:px-8 py-10">
        {error ? (
          <div className="orders-state orders-state-error p-8 text-center" role="alert">
            <p className="font-bold text-lg mb-4">{error}</p>
            <Link className="button button-accent" to="/orders">
              Back to my orders
            </Link>
          </div>
        ) : (
          order && (
            <>
              <div className="home-heading mb-8">
                <h1>
                  {order.paymentStatus === 'PAID' ? 'Thank You for Your Order' : 'Order Details'}
                  .
                </h1>
                <p className="text-[#56607A] text-base">
                  {order.paymentStatus === 'PAID'
                    ? 'Your payment was verified and your order is confirmed.'
                    : 'This order is currently pending payment confirmation.'}
                </p>
              </div>

              <article className="order-details-card bg-white border border-[#DDE1EA] rounded-2xl p-8 shadow-xl">
                {/* Header Strip */}
                <div className="order-card-heading pb-6 border-b border-[#DDE1EA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow !text-xs !mb-1 text-[#56607A]">Receipt</p>
                    <h2 className="tabular-nums text-xl font-bold text-[#0F1B3D]">
                      #{order._id}
                    </h2>
                  </div>
                  <span
                    className={`order-status ${
                      order.status === 'PAID'
                        ? 'border-[#0B7A4B]/30 bg-[#0B7A4B]/10 text-[#0B7A4B]'
                        : 'border-[#2340E6]/30 bg-[#2340E6]/10 text-[#2340E6]'
                    }`}
                  >
                    ● {order.status.replaceAll('_', ' ')}
                  </span>
                </div>

                {/* Items List */}
                <div className="order-detail-items py-4">
                  {order.items.map((item, index) => (
                    <div className="order-detail-item" key={`${item.product}-${index}`}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover bg-[#F4F5F9] border border-[#DDE1EA]"
                        />
                      )}
                      <div>
                        <strong className="text-[#0F1B3D] font-medium text-base">{item.name}</strong>
                        <span className="text-[#56607A] tabular-nums text-xs">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </span>
                      </div>
                      <strong className="text-[#2340E6] tabular-nums text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="order-detail-total flex items-center justify-between pt-4 border-t border-[#DDE1EA]">
                  <span className="text-[#0F1B3D] font-bold text-base">
                    {order.paymentStatus === 'PAID' ? 'Total paid' : 'Order Total'}
                  </span>
                  <strong className="text-2xl text-[#2340E6] tabular-nums font-bold">
                    {formatPrice(order.totalAmount)}
                  </strong>
                </div>

                {/* Shipping Details */}
                <div className="order-shipping mt-8 pt-6 border-t border-[#DDE1EA]">
                  <p className="eyebrow !text-xs !mb-2 text-[#56607A]">Delivering to</p>
                  <strong className="text-[#0F1B3D] text-base">{order.shippingAddress.fullName}</strong>
                  <span className="text-[#56607A] text-sm">
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  </span>
                  <span className="text-[#56607A] tabular-nums text-xs">
                    Contact: {order.shippingAddress.phone}
                  </span>
                </div>

                {/* Payment Line */}
                <p className="order-payment-line mt-6 pt-4 border-t border-[#DDE1EA] text-xs tabular-nums text-[#56607A]">
                  Payment Status: <strong className="text-[#2340E6]">{order.paymentStatus}</strong> · Order Created:{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </article>

              <div className="order-detail-actions mt-8 flex items-center gap-4">
                <Link className="button button-dark" to="/orders">
                  ← Back to Orders
                </Link>
                <Link className="button button-accent" to="/products">
                  Continue shopping
                </Link>
              </div>
            </>
          )
        )}
      </section>
    </main>
  )
}

export default OrderDetails
