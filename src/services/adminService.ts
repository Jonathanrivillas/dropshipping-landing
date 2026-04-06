import { API_URL as API } from '../lib/api'

interface Order {
  id: string
  orderNumber: string
  customer: { fullName: string; email: string; city: string }
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  orderItems: Array<unknown>
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Métricas del Dashboard ──────────────────────────────────────────────────
export const fetchMetrics = async () => {
  const res = await fetch(`${API}/orders/metrics`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Error al obtener métricas')
  return res.json()
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────
export const fetchAllOrders = async (page = 1, limit = 20) => {
  const res = await fetch(`${API}/orders?page=${page}&limit=${limit}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Error al obtener pedidos')
  return res.json() as Promise<{
    orders: Order[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>
}

export const fetchOrderById = async (id: string) => {
  const res = await fetch(`${API}/orders/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Pedido no encontrado')
  return res.json()
}

export const patchOrderStatus = async (id: string, status: string) => {
  const res = await fetch(`${API}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Error al actualizar el estado')
  return res.json()
}

// ─── Productos ───────────────────────────────────────────────────────────────
export const fetchAllProductsAdmin = async () => {
  const res = await fetch(`${API}/products?limit=100`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Error al obtener productos')
  const data = await res.json()
  return data.products ?? data
}

export const fetchProductById = async (id: string) => {
  const res = await fetch(`${API}/products/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}

export const createProduct = async (data: object) => {
  const res = await fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear el producto')
  return res.json()
}

export const updateProduct = async (id: string, data: object) => {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar el producto')
  return res.json()
}

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Error al eliminar el producto')
}
