import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { fetchProductById, createProduct, updateProduct } from '../../services/adminService';

interface VariantField {
  type: string;
  options: string;
}

const CATEGORIES = ['Ropa', 'Accesorios', 'Tecnología', 'Hogar', 'Belleza', 'Deporte'];

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: CATEGORIES[0],
    stock: '',
    featured: false,
    images: '',
    tags: '',
  });
  const [variants, setVariants] = useState<VariantField[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id).then((p) => {
      setForm({
        name:           p.name,
        slug:           p.slug,
        description:    p.description,
        price:          String(p.price),
        compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
        category:       p.category,
        stock:          String(p.stock),
        featured:       p.featured,
        images:         (p.images as string[]).join('\n'),
        tags:           (p.tags as string[]).join(', '),
      });
      setVariants(
        (p.variants as { type: string; options: string[] }[]).map((v) => ({
          type: v.type,
          options: v.options.join(', '),
        }))
      );
      setLoading(false);
    });
  }, [id]);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:           form.name,
        slug:           form.slug || autoSlug(form.name),
        description:    form.description,
        price:          parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        category:       form.category,
        stock:          parseInt(form.stock),
        featured:       form.featured,
        images:         form.images.split('\n').map((s) => s.trim()).filter(Boolean),
        tags:           form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        variants:       variants.map((v) => ({
          type:    v.type,
          options: v.options.split(',').map((s) => s.trim()).filter(Boolean),
        })),
      };

      if (isEdit && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/admin/productos');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
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

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/productos')}
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info básica */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">Información básica</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!isEdit) set('slug', autoSlug(e.target.value));
                }}
                className="input-field"
                placeholder="Camiseta oversize negra"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="camiseta-oversize-negra"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Descripción *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="input-field resize-none"
                placeholder="Describe el producto..."
              />
            </div>
          </div>
        </div>

        {/* Precio y stock */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">Precio e inventario</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Precio (COP) *</label>
              <input
                required
                type="number"
                min="0"
                step="100"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="input-field"
                placeholder="89900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Precio tachado</label>
              <input
                type="number"
                min="0"
                step="100"
                value={form.compareAtPrice}
                onChange={(e) => set('compareAtPrice', e.target.value)}
                className="input-field"
                placeholder="120000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stock *</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                className="input-field"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoría *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-slate-700">Producto destacado (aparece en la HomePage)</span>
          </label>
        </div>

        {/* Imágenes y tags */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">Media y etiquetas</h2>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              URLs de imágenes (una por línea)
            </label>
            <textarea
              rows={3}
              value={form.images}
              onChange={(e) => set('images', e.target.value)}
              className="input-field resize-none font-mono text-xs"
              placeholder="https://example.com/imagen1.jpg&#10;https://example.com/imagen2.jpg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Etiquetas (separadas por coma)
            </label>
            <input
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              className="input-field"
              placeholder="verano, tendencia, unisex"
            />
          </div>
        </div>

        {/* Variantes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700">Variantes</h2>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, { type: '', options: '' }])}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Plus size={13} /> Agregar variante
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-xs text-slate-400">Sin variantes. Ejemplo: Talla → S, M, L, XL</p>
          )}

          {variants.map((v, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Tipo</label>
                <input
                  value={v.type}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], type: e.target.value };
                    setVariants(next);
                  }}
                  className="input-field"
                  placeholder="Talla"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-xs text-slate-500 mb-1">Opciones (coma)</label>
                <input
                  value={v.options}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], options: e.target.value };
                    setVariants(next);
                  }}
                  className="input-field"
                  placeholder="S, M, L, XL"
                />
              </div>
              <button
                type="button"
                onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}
                className="mt-6 p-2 text-rose-500 hover:bg-rose-50 rounded transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
