import { Request, Response, NextFunction } from 'express'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import prisma from '../database/prisma'

function getMPClient() {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error('MP_ACCESS_TOKEN no configurado')
  }
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
}

export const createPaymentPreference = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    })

    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' })
      return
    }

    const customer = order.customer as {
      fullName: string
      email: string
      phone: string
      address: string
      city: string
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const preference = new Preference(getMPClient())
    const response = await preference.create({
      body: {
        items: order.orderItems.map((item) => ({
          id: item.productId,
          title: item.product.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'COP',
        })),
        payer: {
          name: customer.fullName,
          email: customer.email,
        },
        back_urls: {
          success: `${frontendUrl}/pago/resultado`,
          failure: `${frontendUrl}/pago/resultado`,
          pending: `${frontendUrl}/pago/resultado`,
        },
        // auto_return redirige automáticamente tras pago aprobado.
        // Solo funciona con dominios públicos (no localhost).
        ...(process.env.NODE_ENV === 'production' && { auto_return: 'approved' }),
        external_reference: order.orderNumber,
        statement_descriptor: 'Sojo Trendy',
      },
    })

    res.json({ init_point: response.init_point })
  } catch (error) {
    // Log the full MP API error for debugging
    if (error && typeof error === 'object' && 'cause' in error) {
      console.error('[MercadoPago] API error cause:', JSON.stringify((error as any).cause))
    }
    console.error('[MercadoPago] Error al crear preferencia:', error)
    next(error)
  }
}
