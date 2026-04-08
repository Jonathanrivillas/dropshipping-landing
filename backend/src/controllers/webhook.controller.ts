import { Request, Response } from 'express'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import crypto from 'crypto'
import * as orderService from '../services/order.service'

function getMPClient(): MercadoPagoConfig | null {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) return null
  return new MercadoPagoConfig({ accessToken: token })
}

// Mapa de estados de MercadoPago → estados internos de la orden
const MP_STATUS_MAP: Record<string, string> = {
  approved:      'PROCESSING',
  rejected:      'CANCELLED',
  cancelled:     'CANCELLED',
  refunded:      'CANCELLED',
  charged_back:  'CANCELLED',
  // 'pending' e 'in_process' no producen cambio — ya están como PENDING
}

// Estados "avanzados" que no se deben regresar nunca
const LOCKED_STATUSES = new Set(['SHIPPED', 'DELIVERED', 'CANCELLED'])

/**
 * Verifica la firma HMAC-SHA256 que MercadoPago envía en el header x-signature.
 * Si MP_WEBHOOK_SECRET no está configurado, pasa la verificación (modo desarrollo).
 */
function verifySignature(req: Request): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // Sin secret → solo en desarrollo

  const xSignature = req.headers['x-signature'] as string | undefined
  const xRequestId = req.headers['x-request-id'] as string | undefined
  if (!xSignature || !xRequestId) return false

  let ts = ''
  let v1 = ''
  for (const part of xSignature.split(',')) {
    const [key, val] = part.split('=')
    if (key?.trim() === 'ts') ts = val?.trim() ?? ''
    if (key?.trim() === 'v1') v1 = val?.trim() ?? ''
  }
  if (!ts || !v1) return false

  const dataId = (req.body as { data?: { id?: string } })?.data?.id ?? ''
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts}`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  // Responder 200 de inmediato para que MP no reintente
  res.sendStatus(200)

  const body = req.body as {
    type?: string
    action?: string
    data?: { id?: string }
  }

  // Solo nos interesan notificaciones de pagos
  const isPaymentEvent =
    body.type === 'payment' ||
    body.action === 'payment.updated' ||
    body.action === 'payment.created'

  if (!isPaymentEvent) return

  const paymentId = body.data?.id
  if (!paymentId) return

  if (!verifySignature(req)) {
    console.warn('[Webhook MP] Firma inválida — notificación ignorada')
    return
  }

  try {
    const client = getMPClient()
    if (!client) {
      console.warn('[Webhook MP] MP_ACCESS_TOKEN no configurado — notificación ignorada')
      return
    }

    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: paymentId })

    const mpStatus = payment.status ?? ''
    const orderNumber = payment.external_reference

    if (!orderNumber) return

    const newStatus = MP_STATUS_MAP[mpStatus]
    if (!newStatus) {
      // Estado intermedio (in_process, pending) — sin cambio
      return
    }

    // Verificar estado actual para evitar retroceder órdenes
    const order = await orderService.getOrderByOrderNumber(orderNumber)
    if (!order) return
    if (LOCKED_STATUSES.has(order.status)) return
    if (order.status === newStatus) return // Ya está en ese estado

    await orderService.updateOrderStatusByOrderNumber(orderNumber, newStatus)
    console.log(
      `[Webhook MP] Orden ${orderNumber}: ${order.status} → ${newStatus} (pago ${paymentId}, estado MP: ${mpStatus})`
    )
  } catch (err) {
    console.error('[Webhook MP] Error procesando notificación:', err)
  }
}
