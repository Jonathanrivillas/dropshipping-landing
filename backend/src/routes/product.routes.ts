import { Router } from 'express'
import * as productController from '../controllers/product.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', productController.getProducts)
router.get('/slug/:slug', productController.getProductBySlug) // debe ir antes que /:id
router.get('/:id', productController.getProduct)
router.post('/', requireAuth, productController.createProduct)
router.put('/:id', requireAuth, productController.updateProduct)
router.delete('/:id', requireAuth, productController.deleteProduct)

export default router
