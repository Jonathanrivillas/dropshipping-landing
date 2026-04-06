/**
 * Validaciones de negocio para el backend.
 * No usamos librerías externas — validaciones simples y directas
 * para mantener las dependencias al mínimo.
 */

export function validateCreateOrder(body: unknown): string | null {
  if (!body || typeof body !== 'object') return 'El cuerpo de la solicitud es inválido'
  const b = body as Record<string, unknown>

  if (!b.customer || typeof b.customer !== 'object') return 'El campo customer es requerido'
  const c = b.customer as Record<string, unknown>
  if (!c.fullName || typeof c.fullName !== 'string' || c.fullName.trim().length < 3)
    return 'El nombre del cliente debe tener al menos 3 caracteres'
  if (typeof c.fullName === 'string' && c.fullName.length > 100)
    return 'El nombre del cliente no puede superar los 100 caracteres'
  if (!c.email || typeof c.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    return 'El email del cliente es inválido'
  if (typeof c.email === 'string' && c.email.length > 254)
    return 'El email no puede superar los 254 caracteres'
  if (!c.phone || typeof c.phone !== 'string')
    return 'El teléfono del cliente es requerido'
  if (typeof c.phone === 'string' && c.phone.length > 20)
    return 'El teléfono no puede superar los 20 caracteres'
  if (!c.address || typeof c.address !== 'string')
    return 'La dirección es requerida'
  if (typeof c.address === 'string' && c.address.length > 500)
    return 'La dirección no puede superar los 500 caracteres'
  if (!c.city || typeof c.city !== 'string')
    return 'La ciudad es requerida'

  if (!Array.isArray(b.items) || b.items.length === 0)
    return 'La orden debe tener al menos un artículo'
  if (b.items.length > 100)
    return 'La orden no puede tener más de 100 artículos'

  for (const item of b.items) {
    if (!item.productId || typeof item.productId !== 'string')
      return 'Cada artículo debe tener un productId válido'
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1)
      return 'La cantidad de cada artículo debe ser mayor a 0'
    if (item.quantity > 1000)
      return 'La cantidad de un artículo no puede superar 1000'
  }

  if (!b.paymentMethod || typeof b.paymentMethod !== 'string')
    return 'El método de pago es requerido'

  return null // sin errores
}

export function validateCreateProduct(body: unknown): string | null {
  if (!body || typeof body !== 'object') return 'El cuerpo de la solicitud es inválido'
  const b = body as Record<string, unknown>

  if (!b.name || typeof b.name !== 'string' || b.name.trim().length < 2)
    return 'El nombre del producto debe tener al menos 2 caracteres'
  if (!b.slug || typeof b.slug !== 'string' || !/^[a-z0-9-]+$/.test(b.slug))
    return 'El slug solo puede contener letras minúsculas, números y guiones'
  if (!b.description || typeof b.description !== 'string')
    return 'La descripción es requerida'
  if (typeof b.price !== 'number' || b.price <= 0)
    return 'El precio debe ser un número mayor a 0'
  if (typeof b.stock !== 'number' || b.stock < 0)
    return 'El stock no puede ser negativo'
  if (!b.category || typeof b.category !== 'string')
    return 'La categoría es requerida'
  if (!Array.isArray(b.images))
    return 'Las imágenes deben ser un array'

  return null
}
