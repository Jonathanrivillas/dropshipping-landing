import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son requeridos.' })
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
  const jwtSecret = process.env.JWT_SECRET

  if (!adminEmail || !adminPasswordHash || !jwtSecret) {
    res.status(500).json({ error: 'Configuración de servidor incompleta.' })
    return
  }

  if (email !== adminEmail) {
    // Igualamos el tiempo de respuesta para no revelar si el email existe
    await bcrypt.compare(password, '$2b$10$invalidhashpaddingtomatchtime')
    res.status(401).json({ error: 'Credenciales inválidas.' })
    return
  }

  const isValid = await bcrypt.compare(password, adminPasswordHash)
  if (!isValid) {
    res.status(401).json({ error: 'Credenciales inválidas.' })
    return
  }

  const token = jwt.sign({ adminId: 'admin' }, jwtSecret, { expiresIn: '8h' })
  res.json({ token })
}
