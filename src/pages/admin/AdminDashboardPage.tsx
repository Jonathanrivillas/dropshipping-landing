import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, ShoppingBag, Package, AlertTriangle, Clock,
} from 'lucide-react';
import { fetchMetrics } from '../../services/adminService';
import { STATUS_LABELS } from '../../constants/orderStatuses';

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string }>;
  lowStockProducts: Array<{ id: string; name: string; stock: number; slug: string }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function KpiCard({
  title, value, icon: Icon, color, suffix,
}: {
  title: string; value: string | number; icon: React.ElementType; color: string; suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">
          {suffix}{typeof value === 'number' ? value.toLocaleString('es-CO') : value}
        </p>
      </div>
    </div>
  );
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-800">
        ${payload[0].value.toLocaleString('es-CO')}
      </p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics()
      .then(setMetrics)
      .catch(() => setError('No se pudieron cargar las métricas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return <p className="text-red-500">{error || 'Sin datos'}</p>;
  }

  const chartData = metrics.revenueByDay.map((d) => ({
    name: formatDayLabel(d.date),
    revenue: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Ingresos totales"    value={metrics.totalRevenue}       icon={TrendingUp}    color="bg-indigo-500" suffix="$" />
        <KpiCard title="Total pedidos"       value={metrics.totalOrders}        icon={ShoppingBag}   color="bg-emerald-500" />
        <KpiCard title="Total productos"     value={metrics.totalProducts}      icon={Package}       color="bg-sky-500" />
        <KpiCard title="Sin stock"           value={metrics.outOfStockProducts} icon={AlertTriangle} color="bg-rose-500" />
      </div>

      {/* Gráfica + Estado de pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ingresos últimos 7 días */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Ingresos — últimos 7 días</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Estado de pedidos</h2>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([key, { label }]) => {
              const count = metrics.ordersByStatus[key] ?? 0;
              const total = metrics.totalOrders || 1;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-medium text-slate-800">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pedidos recientes + Bajo stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pedidos recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Pedidos recientes
            </h2>
            <Link to="/admin/pedidos" className="text-xs text-indigo-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {metrics.recentOrders.length === 0 && (
              <p className="text-sm text-slate-400">No hay pedidos aún</p>
            )}
            {metrics.recentOrders.map((o) => (
              <Link
                key={o.id}
                to={`/admin/pedidos/${o.id}`}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{o.orderNumber}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-semibold text-slate-700">
                    ${o.total.toLocaleString('es-CO')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bajo stock */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-400" /> Bajo stock ({'≤'}5 uds)
            </h2>
            <Link to="/admin/productos" className="text-xs text-indigo-600 hover:underline">
              Ver inventario
            </Link>
          </div>
          <div className="space-y-3">
            {metrics.lowStockProducts.length === 0 && (
              <p className="text-sm text-slate-400">Todos los productos tienen stock suficiente ✓</p>
            )}
            {metrics.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <p className="text-sm text-slate-700 truncate max-w-[60%]">{p.name}</p>
                <span
                  className={`text-sm font-semibold ${
                    p.stock === 0 ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top productos */}
      {metrics.topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Productos más vendidos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">#</th>
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Producto</th>
                  <th className="text-right text-slate-500 font-medium py-2 pr-4">Unidades</th>
                  <th className="text-right text-slate-500 font-medium py-2">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topProducts.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
                    <td className="py-2 pr-4 text-slate-700 font-medium">{p.name}</td>
                    <td className="py-2 pr-4 text-right text-slate-600">{p.quantity}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      ${p.revenue.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
