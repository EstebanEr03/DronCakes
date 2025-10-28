import express from 'express'
import { newOrder, getOrders, updateOrderStatus, completeOrder } from '../controllers/ordersController.js'

const router = express.Router()

router.post('/', newOrder)
router.get('/', getOrders)
router.put('/:id/status', updateOrderStatus)
router.put('/:id/complete', completeOrder)

export default router
