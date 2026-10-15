import express from 'express'
import {registerCustomer, loginCustomer, getMe, updateCustomerProfile, uploadCustomerProfileImage, logoutCustomer} from '../controllers/customer.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'
import upload from '../middlewares/upload.middleware.js'


const customerRoutes = express.Router()

customerRoutes.post('/register', registerCustomer)
customerRoutes.post('/login', loginCustomer)
customerRoutes.get('/me', isAuthenticated, getMe)
customerRoutes.put('/profile', isAuthenticated, updateCustomerProfile)
customerRoutes.post('/profile/image', isAuthenticated, upload.single('profileImage'), uploadCustomerProfileImage)
customerRoutes.post('/logout', logoutCustomer)

export default customerRoutes