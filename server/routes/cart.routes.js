import express from 'express'
import { addToCart, getCart, updateCartItemQuantity, removeFromCart } from '../controllers/cart.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const cartRoutes = express.Router()

cartRoutes.use(isAuthenticated)
cartRoutes.post('/:productId', addToCart)
cartRoutes.get('/', getCart)
cartRoutes.patch('/:productId', updateCartItemQuantity)
cartRoutes.delete('/:productId', removeFromCart)

export default cartRoutes
