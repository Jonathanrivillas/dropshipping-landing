/**
 * URL base de la API REST.
 * Leída de la variable de entorno VITE_API_URL.
 * Único lugar en el frontend donde está definida — todos los servicios
 * importan desde aquí para que un solo cambio afecte a toda la app.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
