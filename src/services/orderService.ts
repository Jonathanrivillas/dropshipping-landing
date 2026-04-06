import type { Order, CartItem } from '../types';
import { API_URL } from '../lib/api';

export interface CreateOrderData {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    department: string;
  };
  items: CartItem[];
  totalPrice: number;
  paymentMethod: 'card' | 'transfer' | 'mercadopago';
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const payload = {
    customer: data.customerInfo,
    items: data.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    paymentMethod: data.paymentMethod,
  };

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Error al procesar la orden. Intenta de nuevo.');
  }

  const backendOrder = await response.json();

  const order: Order = {
    id: backendOrder.id,
    orderNumber: backendOrder.orderNumber,
    customerInfo: data.customerInfo,
    items: data.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      selectedVariants: item.selectedVariants,
    })),
    totalPrice: backendOrder.total,
    paymentMethod: data.paymentMethod,
    status: backendOrder.status ?? 'PENDING',
    createdAt: backendOrder.createdAt,
  };

  return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const response = await fetch(`${API_URL}/orders/number/${orderNumber}`);

  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error('Error al cargar la orden');
  }

  const backendOrder = await response.json();
  const customer = backendOrder.customer as Order['customerInfo'];

  return {
    id: backendOrder.id,
    orderNumber: backendOrder.orderNumber,
    customerInfo: customer,
    items: (backendOrder.orderItems ?? []).map((oi: { product: { id: string; name: string }; price: number; quantity: number }) => ({
      productId: oi.product?.id ?? '',
      productName: oi.product?.name ?? '',
      price: oi.price,
      quantity: oi.quantity,
      selectedVariants: {},
    })),
    totalPrice: backendOrder.total,
    paymentMethod: (backendOrder.paymentMethod ?? 'card') as Order['paymentMethod'],
    status: (backendOrder.status ?? 'PENDING') as Order['status'],
    createdAt: backendOrder.createdAt,
  };
}

export async function createPaymentPreference(orderId: string): Promise<{ init_point: string }> {
  const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Error al crear la preferencia de pago.');
  }

  return response.json();
}
