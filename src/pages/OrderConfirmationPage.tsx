// ============================================================
// ORDER CONFIRMATION PAGE — HU-10
// ============================================================
// Pantalla de éxito que se muestra al finalizar el checkout.
// Lee el número de pedido desde la URL con useParams().
// Intenta cargar los detalles de la orden desde la API.
//
// URL de entrada: /confirmacion/:orderNumber
// Ejemplo real:   /confirmacion/ORD-2026-123456
//
// FLUJO:
//   CheckoutPage → clearCart() + navigate('/confirmacion/ORD-2026-123456')
//   └── Esta página muestra el número y detalles de la orden
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getOrderByNumber } from '../services/orderService';
import { SEO } from '../components/SEO';
import type { Order } from '../types';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;

    getOrderByNumber(orderNumber)
      .then(data => setOrder(data || null))
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [orderNumber]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-up">

      {/* SEO Meta Tags */}
      <SEO 
        title="Pedido Confirmado"
        description="Tu pedido ha sido confirmado exitosamente. Gracias por tu compra en Sojo Trendy."
        canonical="/confirmacion"
        noindex={true}
      />

      {/* Ícono de éxito animado */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
          <CheckCircle2 size={48} className="text-success" />
        </div>
      </div>

      {/* Título y subtítulo */}
      <h1 className="text-3xl font-bold text-foreground mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-muted-foreground mb-2">
        Gracias por tu compra. Pronto recibirás un correo con los detalles.
      </p>

      {/* Número de pedido — viene de la URL via useParams */}
      <div className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-5 py-3 my-6">
        <span className="text-sm text-muted-foreground">Número de pedido:</span>
        <span className="font-bold text-primary text-base tracking-wider">
          #{orderNumber}
        </span>
      </div>

      {/* Detalles de la orden si están disponibles */}
      {!isLoading && order && (
        <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4 mb-8">
          <h2 className="font-semibold text-foreground text-lg">Resumen de tu pedido</h2>
          
          {/* Productos */}
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{item.productName}</p>
                  {Object.keys(item.selectedVariants).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Object.entries(item.selectedVariants).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-foreground">{formatPrice(item.price)}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>

          {/* Información de envío */}
          <div className="pt-4 border-t border-border">
            <h3 className="font-medium text-foreground text-sm mb-2">Envío a:</h3>
            <p className="text-sm text-muted-foreground">
              {order.customerInfo.fullName}<br />
              {order.customerInfo.address}<br />
              {order.customerInfo.city}, {order.customerInfo.department}<br />
              {order.customerInfo.phone}
            </p>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3 mb-8">
        <h2 className="font-semibold text-foreground">¿Qué sigue?</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">1.</span>
            Recibirás un email de confirmación con el resumen de tu pedido.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">2.</span>
            Nuestro equipo preparará tu paquete en 1-2 días hábiles.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">3.</span>
            Recibirás un número de guía para rastrear tu envío.
          </li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/tienda">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            <ShoppingBag size={18} />
            Seguir comprando
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            <Home size={18} />
            Ir al inicio
          </Button>
        </Link>
      </div>
    </main>
  );
}
