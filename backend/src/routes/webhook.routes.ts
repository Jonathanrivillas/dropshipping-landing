import { Router } from 'express'
import { handleWebhook } from '../controllers/webhook.controller'

const router = Router()

// MercadoPago envía POST a esta ruta cuando cambia el estado de un pago
router.post('/', handleWebhook)

export default router
