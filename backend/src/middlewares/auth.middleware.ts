import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  adminId?: string
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Token requerido.' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'Configuración de servidor incompleta.' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as { adminId: string }
    req.adminId = payload.adminId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}
