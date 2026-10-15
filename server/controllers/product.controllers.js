import mongoose from 'mongoose'
import Product from '../model/product.model.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const productFields = 'name description price category image stock createdAt'

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body

        if (!name || !description || !category || !image || price === undefined || stock === undefined) {
            return res.status(400).json({ message: 'Name, description, price, category, image, and stock are required' })
        }

        if (Number(price) <= 0 || Number.isNaN(Number(price))) {
            return res.status(400).json({ message: 'Price must be greater than 0' })
        }

        if (Number(stock) < 0 || Number.isNaN(Number(stock))) {
            return res.status(400).json({ message: 'Stock cannot be negative' })
        }

        const product = await Product.create({ name, description, price, category, image, stock })
        return res.status(201).json({ success: true, product })
    } catch (error) {
        return res.status(400).json({ message: 'Unable to create product', error: error.message })
    }
}

export const getProducts = async (req, res) => {
    try {
        const { search = '', category = '', sort = '' } = req.query
        const filters = {}

        if (search.trim()) {
            filters.name = { $regex: escapeRegex(search.trim()), $options: 'i' }
        }

        if (category.trim() && category !== 'All Categories') {
            filters.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' }
        }

        const sortOption = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: -1 }
        const products = await Product.find(filters).select(productFields).sort(sortOption)

        return res.status(200).json({ success: true, count: products.length, products })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch products', error: error.message })
    }
}

export const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        const product = await Product.findById(req.params.id).select(productFields)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        return res.status(200).json({ success: true, product })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch product', error: error.message })
    }
}