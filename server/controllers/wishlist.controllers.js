import mongoose from 'mongoose'
import Customer from '../model/customer.model.js'
import Product from '../model/product.model.js'

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        const productExists = await Product.exists({ _id: productId })
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const customer = await Customer.findOneAndUpdate(
            { _id: req.customer._id,
             wishlist: { $ne: productId }
            },

            { $addToSet: { wishlist: productId } },
            { returnDocument: 'after' }
        )

        if (!customer) {
            return res.status(409).json({ message: 'Product is already in your wishlist' })
        }

        return res.status(200).json({ success: true, message: 'Product added to wishlist' })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to add product to wishlist', error: error.message })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).populate({
            path: 'wishlist',
            select: 'name price category image stock'
        })

        if (!customer) {
            return res.status(401).json({ message: 'Customer not found' })
        }

        const wishlist = customer.wishlist.filter(Boolean)
        return res.status(200).json({ success: true, count: wishlist.length, wishlist })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch wishlist', error: error.message })
    }
}

export const getWishlistCount = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).populate({
            path: 'wishlist',
            select: '_id'
        })

        if (!customer) {
            return res.status(401).json({ message: 'Customer not found' })
        }

        const count = customer.wishlist.filter(Boolean).length
        return res.status(200).json({ success: true, count })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch wishlist count', error: error.message })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        const customer = await Customer.findOneAndUpdate(
            { _id: req.customer._id, wishlist: productId },
            { $pull: { wishlist: productId } },
            { returnDocument: 'after' }
        )

        if (!customer) {
            return res.status(404).json({ message: 'Product is not in your wishlist' })
        }

        return res.status(200).json({ success: true, message: 'Product removed from wishlist' })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to remove product from wishlist', error: error.message })
    }
}