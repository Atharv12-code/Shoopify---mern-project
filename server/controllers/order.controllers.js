import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Razorpay from 'razorpay'
import Customer from '../model/customer.model.js'
import Order from '../model/order.model.js'
import Product from '../model/product.model.js'

const normalizeShippingAddress = (shippingAddress) => {
    if (!shippingAddress || typeof shippingAddress !== 'object') {
        return null
    }

    const address = {
        fullName: String(shippingAddress.fullName || '').trim(),
        phone: String(shippingAddress.phone || '').trim(),
        addressLine1: String(shippingAddress.addressLine1 || '').trim(),
        city: String(shippingAddress.city || '').trim(),
        state: String(shippingAddress.state || '').trim(),
        pincode: String(shippingAddress.pincode || '').trim()
    }

    if (Object.values(address).some((value) => !value)) {
        return null
    }

    const phoneDigits = address.phone.replace(/\D/g, '')
    if (!/^\+?[0-9\s()-]{10,16}$/.test(address.phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
        return null
    }

    if (!/^\d{6}$/.test(address.pincode)) {
        return null
    }

    return address
}

const getRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret || !keyId.startsWith('rzp_test_')) {
        return null
    }

    return {
        keyId,
        client: new Razorpay({ key_id: keyId, key_secret: keySecret })
    }
}

export const createPaymentOrder = async (req, res) => {
    const razorpay = getRazorpayClient()
    if (!razorpay) {
        return res.status(503).json({ message: 'Razorpay is not configured. Add the test API keys to server/.env.' })
    }

    const shippingAddress = normalizeShippingAddress(req.body?.shippingAddress)
    if (!shippingAddress) {
        return res.status(400).json({ message: 'Enter a valid shipping address, phone number, and 6-digit pincode.' })
    }

    let pendingOrder

    try {
        const customer = await Customer.findById(req.customer._id)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        if (!customer.cart.length) {
            return res.status(400).json({ message: 'Your cart is empty.' })
        }

        const cartProductIds = customer.cart.map((item) => item.product)
        const products = await Product.find({ _id: { $in: cartProductIds } })
        const productsById = new Map(products.map((product) => [product._id.toString(), product]))
        const orderItems = []
        let totalAmountPaise = 0

        for (const cartItem of customer.cart) {
            const productId = cartItem.product.toString()
            const product = productsById.get(productId)

            if (!product) {
                return res.status(400).json({ message: 'A product in your cart is no longer available. Update your cart and try again.' })
            }

            if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
                return res.status(400).json({ message: `Invalid quantity for ${product.name}. Update your cart and try again.` })
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available.` })
            }

            const pricePaise = Math.round(Number(product.price) * 100)
            totalAmountPaise += pricePaise * cartItem.quantity
            orderItems.push({
                product: product._id,
                name: product.name,
                price: pricePaise / 100,
                quantity: cartItem.quantity,
                image: product.image
            })
        }

        if (!Number.isSafeInteger(totalAmountPaise) || totalAmountPaise < 1) {
            return res.status(400).json({ message: 'The cart total is invalid. Please review your cart.' })
        }

        pendingOrder = await Order.create({
            customer: customer._id,
            items: orderItems,
            shippingAddress,
            totalAmount: totalAmountPaise / 100
        })

        let razorpayOrder
        try {
            razorpayOrder = await razorpay.client.orders.create({
                amount: totalAmountPaise,
                currency: 'INR',
                receipt: pendingOrder._id.toString()
            })
        } catch (error) {
            console.error('Razorpay order creation failed:', error.message)
            await Order.deleteOne({ _id: pendingOrder._id })
            return res.status(502).json({ message: 'Unable to start payment right now. Please try again.' })
        }

        pendingOrder.razorpayOrderId = razorpayOrder.id
        await pendingOrder.save()

        return res.status(201).json({
            success: true,
            orderId: pendingOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: razorpay.keyId
        })
    } catch (error) {
        if (pendingOrder?._id) {
            await Order.deleteOne({ _id: pendingOrder._id })
        }
        console.error('Unable to create payment order:', error.message)
        return res.status(500).json({ message: 'Unable to create your order. Please try again.' })
    }
}

export const verifyPayment = async (req, res) => {
    const { orderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body || {}
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
        return res.status(503).json({ message: 'Razorpay is not configured. Add the test API keys to server/.env.' })
    }

    if (!mongoose.Types.ObjectId.isValid(orderId) || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification details are incomplete.' })
    }

    try {
        const order = await Order.findOne({ _id: orderId, customer: req.customer._id })
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }

        if (order.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({ message: 'Payment does not match this order.' })
        }

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex')
        const expectedBuffer = Buffer.from(expectedSignature, 'hex')
        const receivedBuffer = /^[a-f\d]{64}$/i.test(razorpaySignature)
            ? Buffer.from(razorpaySignature, 'hex')
            : Buffer.alloc(0)

        if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
            return res.status(400).json({ message: 'Payment verification failed. Your cart has not been cleared.' })
        }

        if (order.paymentStatus === 'PAID') {
            if (order.razorpayPaymentId !== razorpayPaymentId) {
                return res.status(409).json({ message: 'This order has already been paid with a different payment.' })
            }
            await Customer.updateOne({ _id: req.customer._id }, { $set: { cart: [] } })
            return res.status(200).json({ success: true, order })
        }

        order.paymentStatus = 'PAID'
        order.status = 'PLACED'
        order.razorpayPaymentId = razorpayPaymentId
        await order.save()
        await Customer.updateOne({ _id: req.customer._id }, { $set: { cart: [] } })

        return res.status(200).json({ success: true, order })
    } catch (error) {
        console.error('Unable to verify payment:', error.message)
        return res.status(500).json({ message: 'Unable to verify payment. Please contact support before retrying.' })
    }
}

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 })
        return res.status(200).json({ success: true, orders })
    } catch (error) {
        console.error('Unable to fetch orders:', error.message)
        return res.status(500).json({ message: 'Unable to load your orders. Please try again.' })
    }
}

export const getOrder = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Order not found.' })
    }

    try {
        const order = await Order.findOne({ _id: id, customer: req.customer._id })
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }
        return res.status(200).json({ success: true, order })
    } catch (error) {
        console.error('Unable to fetch order:', error.message)
        return res.status(500).json({ message: 'Unable to load this order. Please try again.' })
    }
}
