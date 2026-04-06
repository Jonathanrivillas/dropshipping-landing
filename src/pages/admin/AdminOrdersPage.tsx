import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { fetchAllOrders } from '../../services/adminService';
import { STATUS_LABELS } from '../../constants/orderStatuses';

interface Customer {
  fullName: string;
  email: string;
  city: string;
  phone?: string;
  address?: string;
  department?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: Array<unknown>;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchedPage, setFetchedPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;
  const loading = fetchedPage !== page;

  useEffect(() => {
    fetchAllOrders(page, LIMIT)
      .then((data) => {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setFetchedPage(page);
      })
      .catch(() => setFetchedPage(page));
  }, [page]);

  const filtered = orders.filter((o) => {
    const customer = o.customer as Customer;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número, nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="ALL">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">No se encontraron pedidos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Número', 'Cliente', 'Ciudad', 'Artículos', 'Total', 'Estado', 'Fecha', ''].map((h) => (
                    <th key={h} className="text-left text-slate-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => {
                    const customer = o.customer as Customer;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{o.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{customer?.fullName}</p>
                        <p className="text-xs text-slate-400">{customer?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{customer?.city}</td>
                      <td className="px-4 py-3 text-slate-600 text-center">{o.orderItems.length}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        ${o.total.toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/pedidos/${o.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          <Eye size={14} /> Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">{filtered.length} de {total} pedido(s)</p>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
