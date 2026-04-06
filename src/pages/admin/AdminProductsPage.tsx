import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { fetchAllProductsAdmin, deleteProduct } from '../../services/adminService';

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured: boolean;
  images: string[];
}

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProductsAdmin()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Error al eliminar el producto');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
        <button
          onClick={() => navigate('/admin/productos/nuevo')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Producto', 'Categoría', 'Precio', 'Stock', 'Destacado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left text-slate-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const images = p.images as unknown as string[];
                  const img = images?.[0];
                  const stockColor =
                    p.stock === 0
                      ? 'text-rose-600 bg-rose-50'
                      : p.stock <= 5
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-emerald-600 bg-emerald-50';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                          )}
                          <div>
                            <p className="font-medium text-slate-800 max-w-[180px] truncate">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.category}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">${p.price.toLocaleString('es-CO')}</p>
                        {p.compareAtPrice && (
                          <p className="text-xs text-slate-400 line-through">${p.compareAtPrice.toLocaleString('es-CO')}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stockColor}`}>
                          {p.stock === 0 && <AlertTriangle size={11} />}
                          {p.stock} uds
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.featured ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.featured ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/productos/${p.id}/editar`}
                            className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600 transition-colors"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-500 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 py-12 text-sm">No se encontraron productos</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">{filtered.length} producto(s)</p>
    </div>
  );
}
