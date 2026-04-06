import { Router } from 'express'
import * as orderController from '../controllers/order.controller'
import { createPaymentPreference } from '../controllers/payment.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/metrics', requireAuth, orderController.getMetrics)       // antes que /:id
router.get('/number/:orderNumber', orderController.getOrderByNumber)  // público (página de confirmación)
router.patch('/number/:orderNumber/status', orderController.updateOrderStatusByNumber) // webhook MP (sin auth por ahora)
router.post('/', orderController.createOrder)                         // público (clientes crean órdenes)
router.get('/', requireAuth, orderController.getOrders)               // solo admin
router.get('/:id', requireAuth, orderController.getOrder)             // solo admin
router.patch('/:id/status', requireAuth, orderController.updateOrderStatus) // solo admin
router.post('/:id/payment', createPaymentPreference)         // público (cliente paga)

export default router
