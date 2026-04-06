import { Request, Response } from 'express'
import * as productService from '../services/product.service'
import { validateCreateProduct } from '../utils/validate'

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, q: search, page, limit } = req.query
    const result = await productService.getAllProducts({
      category: category as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Error al obtener el producto' })
  }
}

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug)
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Error al obtener el producto' })
  }
}

export const createProduct = async (req: Request, res: Response) => {
  const validationError = validateCreateProduct(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const product = await productService.createProduct(req.body)
    res.status(201).json(product)
  } catch {
    res.status(500).json({ error: 'Error al crear el producto' })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body)
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Error al actualizar el producto' })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(req.params.id)
    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Error al eliminar el producto' })
  }
}
