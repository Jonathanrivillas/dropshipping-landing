import { Request, Response } from 'express'
import * as orderService from '../services/order.service'
import { validateCreateOrder } from '../utils/validate'

export const createOrder = async (req: Request, res: Response) => {
  const validationError = validateCreateOrder(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const order = await orderService.createOrder(req.body)
    res.status(201).json(order)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear la orden'
    res.status(400).json({ error: message })
  }
}

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrderById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' })
    res.json(order)
  } catch {
    res.status(500).json({ error: 'Error al obtener la orden' })
  }
}

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const result = await orderService.getAllOrders(page, limit)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Error al obtener las órdenes' })
  }
}

export const getOrderByNumber = async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrderByOrderNumber(req.params.orderNumber)
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' })
    res.json(order)
  } catch {
    res.status(500).json({ error: 'Error al obtener la orden' })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'El campo status es requerido' })
    const order = await orderService.updateOrderStatus(req.params.id, status)
    res.json(order)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el estado'
    res.status(400).json({ error: message })
  }
}

export const updateOrderStatusByNumber = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'El campo status es requerido' })
    const order = await orderService.updateOrderStatusByOrderNumber(req.params.orderNumber, status)
    res.json(order)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el estado'
    res.status(400).json({ error: message })
  }
}

export const getMetrics = async (_req: Request, res: Response) => {
  try {
    const metrics = await orderService.getMetrics()
    res.json(metrics)
  } catch {
    res.status(500).json({ error: 'Error al obtener métricas' })
  }
}
