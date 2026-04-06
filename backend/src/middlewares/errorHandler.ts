import { Request, Response, NextFunction } from 'express'

/**
 * Middleware global de manejo de errores.
 * Express lo reconoce por tener 4 parámetros (err, req, res, next).
 * Debe registrarse DESPUÉS de todas las rutas en server.ts.
 *
 * Garantiza que cualquier error no capturado devuelva JSON en vez
 * de HTML (que es lo que Express haría por defecto) — crítico cuando
 * el frontend consume la API.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const message =
    err instanceof Error ? err.message : 'Error interno del servidor'

  const status =
    (err as { status?: number })?.status ?? 500

  // En desarrollo, loguea el stack trace completo
  if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
    console.error(err.stack)
  } else {
    console.error(`[ERROR] ${status}: ${message}`)
  }

  res.status(status).json({ error: message })
}

/**
 * Middleware para rutas no encontradas (404).
 * Registrar antes que errorHandler pero después de todas las rutas.
 */
export function notFound(req: Request, _res: Response, next: NextFunction) {
  const err = Object.assign(new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`), { status: 404 })
  next(err)
}
