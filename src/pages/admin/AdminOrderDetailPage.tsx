import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { fetchOrderById, patchOrderStatus } from '../../services/adminService';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string; email: string; phone: string;
    address: string; city: string; department: string;
  };
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

const STATUSES = [
  { value: 'PENDING',    label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'PROCESSING', label: 'Procesando', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'SHIPPED',    label: 'Enviado',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'DELIVERED',  label: 'Entregado',  color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'CANCELLED',  label: 'Cancelado',  color: 'bg-red-100 text-red-700 border-red-200' },
];

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchOrderById(id)
      .then((o) => { setOrder(o); setSelectedStatus(o.status); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async () => {
    if (!order || selectedStatus === order.status) return;
    setSaving(true);
    try {
      const updated = await patchOrderStatus(order.id, selectedStatus);
      setOrder(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return <p className="text-red-500">Pedido no encontrado</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{order.orderNumber}</h1>
          <p className="text-sm text-slate-400">
            {new Date(order.createdAt).toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-5">
          {/* Artículos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Artículos del pedido</h2>
            <div className="space-y-3">
              {order.orderItems.map((item) => {
                const img = (item.product?.images as unknown as string[])?.[0];
                return (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                    {img ? (
                      <img src={img} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg bg-slate-100" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product?.name}</p>
                      <p className="text-xs text-slate-400">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs text-slate-400">${item.price.toLocaleString('es-CO')} c/u</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="text-lg font-bold text-slate-900">${order.total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Datos del cliente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Nombre',       order.customer.fullName],
                ['Email',        order.customer.email],
                ['Teléfono',     order.customer.phone],
                ['Dirección',    order.customer.address],
                ['Ciudad',       order.customer.city],
                ['Departamento', order.customer.department],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-slate-800 font-medium">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Cambiar estado */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-700 mb-3">Estado del pedido</h2>
            <div className="space-y-2 mb-4">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                    selectedStatus === s.value
                      ? s.color + ' font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                  {selectedStatus === s.value && <Check size={14} />}
                </button>
              ))}
            </div>
            <button
              onClick={handleStatusChange}
              disabled={saving || selectedStatus === order.status}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <><Check size={14} /> Guardado</>
              ) : (
                'Actualizar estado'
              )}
            </button>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-700 mb-3">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Método de pago</span>
                <span className="font-medium text-slate-800 capitalize">
                  {order.paymentMethod === 'card' ? 'Tarjeta' : order.paymentMethod === 'transfer' ? 'Transferencia' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Artículos</span>
                <span className="font-medium text-slate-800">{order.orderItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Última actualización</span>
                <span className="font-medium text-slate-800">
                  {new Date(order.updatedAt).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
