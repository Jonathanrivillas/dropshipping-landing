import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { SEO } from '../components/SEO';
import { API_URL } from '../lib/api';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  // MercadoPago envía collection_status (o status) y external_reference (nuestro orderNumber)
  const status = searchParams.get('collection_status') || searchParams.get('status') || 'failure';
  const orderNumber = searchParams.get('external_reference');

  useEffect(() => {
    if (status === 'approved' && orderNumber) {
      clearCart();
      // Actualizar la orden a PROCESSING en el backend
      fetch(`${API_URL}/orders/number/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSING' }),
      }).catch(() => {
        // No bloqueamos al usuario si falla — el admin puede corregir manualmente
      });
    }
  }, [status, orderNumber, clearCart]);

  // ── PAGO APROBADO ────────────────────────────────────────────
  if (status === 'approved') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center animate-fade-up">
        <SEO
          title="¡Pago exitoso! — Sojo Trendy"
          description="Tu pago fue procesado correctamente."
          noindex={true}
        />
        <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">¡Pago exitoso!</h1>
        <p className="text-muted-foreground mb-2">
          Tu pago fue procesado correctamente por MercadoPago.
        </p>
        {orderNumber && (
          <p className="text-muted-foreground mb-8">
            Número de pedido:{' '}
            <span className="font-semibold text-foreground">{orderNumber}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderNumber && (
            <Link
              to={`/confirmacion/${orderNumber}`}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver mi pedido
            </Link>
          )}
          <Link
            to="/tienda"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </main>
    );
  }

  // ── PAGO PENDIENTE ───────────────────────────────────────────
  if (status === 'pending' || status === 'in_process') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center animate-fade-up">
        <SEO
          title="Pago pendiente — Sojo Trendy"
          description="Tu pago está siendo procesado."
          noindex={true}
        />
        <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Pago en proceso</h1>
        <p className="text-muted-foreground mb-2">
          Tu pago está siendo verificado. Te notificaremos por email cuando se confirme.
        </p>
        {orderNumber && (
          <p className="text-muted-foreground mb-8">
            Número de pedido:{' '}
            <span className="font-semibold text-foreground">{orderNumber}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderNumber && (
            <Link
              to={`/confirmacion/${orderNumber}`}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver estado del pedido
            </Link>
          )}
          <Link
            to="/tienda"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  // ── PAGO FALLIDO ─────────────────────────────────────────────
  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center animate-fade-up">
      <SEO
        title="Pago no completado — Sojo Trendy"
        description="No se pudo procesar el pago."
        noindex={true}
      />
      <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3">Pago no completado</h1>
      <p className="text-muted-foreground mb-8">
        Hubo un problema al procesar tu pago. Puedes intentarlo de nuevo — tu carrito sigue guardado.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/checkout"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </Link>
        <Link
          to="/tienda"
          className="inline-flex items-center justify-center px-6 py-2.5 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
