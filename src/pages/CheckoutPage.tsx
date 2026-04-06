// ============================================================
// CHECKOUT PAGE — HU-09
// ============================================================
// Layout de dos columnas: formulario de envío | resumen del pedido.
//
// LIBRERÍAS:
//   react-hook-form → gestiona los valores y errores del form
//   zod             → define las reglas de validación
//   zodResolver     → conecta ambas librerías
//
// FLUJO:
//   1. Usuario rellena el formulario
//   2. Al hacer submit, zod valida cada campo
//   3. Si todo es correcto, onSubmit() corre:
//      a. Genera un número de pedido aleatorio
//      b. Vacía el carrito
//      c. Redirige a /confirmacion/:orderNumber
//   4. Si hay errores, se muestran debajo de cada campo
// ============================================================

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { createOrder, createPaymentPreference } from '../services/orderService';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

// ─── 1. ESQUEMA DE VALIDACIÓN ─────────────────────────────────
// z.object() define la "forma" del formulario y las reglas de cada campo.
// Zod valida TODOS los campos antes de llamar a onSubmit.
// Si algo falla, react-hook-form pone el mensaje en errors.campo.message.
const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),

  email: z
    .string()
    .email('Ingresa un email válido'),

  phone: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(15, 'El teléfono es demasiado largo')
    .regex(/^\d+$/, 'Solo se permiten números'),

  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres'),

  city: z
    .string()
    .min(2, 'Ingresa una ciudad válida'),

  department: z
    .string()
    .min(2, 'Ingresa un departamento válido'),
});

// ─── 2. TIPO INFERIDO DEL ESQUEMA ────────────────────────────
// z.infer<> convierte el esquema zod en un tipo TypeScript.
// No necesitamos escribir la interfaz a mano — zod la genera.
type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── 3. COMPONENTE DE CAMPO REUTILIZABLE ─────────────────────
// Encapsula label + input + mensaje de error para no repetir
// la misma estructura HTML en cada uno de los 6 campos.
interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {/* El error solo se renderiza si existe — cortocircuito con && */}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}

// ─── 4. ESTILOS COMPARTIDOS DEL INPUT ────────────────────────
// Una constante de clases Tailwind para todos los inputs.
// Si mañana quieres cambiar el estilo de todos, editas un solo lugar.
const inputClass = [
  'w-full rounded-lg border border-border bg-card px-3 py-2.5',
  'text-sm text-foreground placeholder:text-muted-foreground',
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
  'transition-colors',
].join(' ');

// ─── 5. COMPONENTE PRINCIPAL ──────────────────────────────────
export function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // useForm: el hook principal de react-hook-form.
  // register  → conecta cada input con el formulario
  // handleSubmit → wrapper que valida antes de llamar a onSubmit
  // formState.errors → objeto con los errores de cada campo
  // formState.isSubmitting → true mientras onSubmit es async
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema), // zod valida los datos
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  // SubmitHandler<T>: tipo de react-hook-form para el onSubmit.
  // Ahora recibe los datos del formulario como argumento.
  const onSubmit: SubmitHandler<CheckoutFormData> = async (formData) => {
    setSubmitError(null);

    try {
      const order = await createOrder({
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          department: formData.department,
        },
        items,
        totalPrice,
        paymentMethod: 'mercadopago',
      });

      const { init_point } = await createPaymentPreference(order.id);
      // Redirige al checkout de MercadoPago (URL externa)
      window.location.assign(init_point);
    } catch {
      setSubmitError('Error al procesar tu pedido. Por favor intenta de nuevo.');
    }
  };

  // Si el carrito está vacío (ej: el usuario entró directo a /checkout),
  // redirigir a la tienda. Protección simple sin librerías extra.
  if (totalItems === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Tu carrito está vacío.</p>
        <Link to="/tienda" className="text-primary hover:underline font-medium">
          ← Volver a la tienda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-up">

      {/* SEO Meta Tags */}
      <SEO 
        title="Checkout"
        description="Completa tu compra de forma segura en Sojo Trendy. Env\u00edo a toda Colombia."
        canonical="/checkout"
        noindex={true}
      />

      {/* ── BREADCRUMB ────────────────────────────────────────── */}
      <Breadcrumbs 
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Tienda', href: '/tienda' },
          { label: 'Checkout' }, // Sin href = página actual
        ]}
      />

      {/* ── ENCABEZADO ───────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Seguir comprando
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground mt-1">
          Completa tus datos para finalizar la compra
        </p>
      </div>

      {/* ── LAYOUT DOS COLUMNAS ──────────────────────────────── */}
      {/* En móvil: columna. En desktop (lg): dos columnas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ── COLUMNA 1: FORMULARIO ────────────────────────── */}
        {/* handleSubmit(onSubmit): valida → si pasa → llama onSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground text-lg">
              Información de contacto
            </h2>

            <Field label="Nombre completo" error={errors.fullName?.message}>
              <input
                {...register('fullName')}
                placeholder="Juan García"
                className={inputClass}
              />
            </Field>

            {/* Grid de dos columnas para email y teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="juan@email.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Teléfono" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="3001234567"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground text-lg">
              Dirección de envío
            </h2>

            <Field label="Dirección" error={errors.address?.message}>
              <input
                {...register('address')}
                placeholder="Calle 123 # 45-67, Apto 8"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ciudad" error={errors.city?.message}>
                <input
                  {...register('city')}
                  placeholder="Bogotá"
                  className={inputClass}
                />
              </Field>

              <Field label="Departamento" error={errors.department?.message}>
                <input
                  {...register('department')}
                  placeholder="Cundinamarca"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* ── MÉTODO DE PAGO ───────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-lg">Método de pago</h2>
            <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-[#009ee3] bg-[#009ee3]/5">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-lg bg-[#009ee3] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MP</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">MercadoPago</p>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Acepta tarjetas de crédito y débito, PSE, Nequi, Daviplata y efectivo.
                  Serás redirigido a MercadoPago para completar el pago de forma segura.
                </p>
              </div>
            </div>
          </div>

          {/* Indicador de seguridad */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck size={16} className="text-success flex-shrink-0" />
            <span>Tus datos están protegidos y no se comparten con terceros.</span>
          </div>

          {/* Mensaje de error si falla el envío */}
          {submitError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Botón de envío — deshabilitado mientras procesa */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Redirigiendo a MercadoPago...' : 'Ir a pagar con MercadoPago →'}
          </Button>
        </form>

        {/* ── COLUMNA 2: RESUMEN ───────────────────────────── */}
        {/* sticky top-24: se queda fijo mientras scrolleas el formulario */}
        <aside className="bg-card border border-border rounded-2xl p-6 space-y-4 sticky top-24">
          <h2 className="font-semibold text-foreground text-lg">
            Resumen del pedido
          </h2>

          {/* Lista de productos en el carrito */}
          <ul className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {items.map(item => (
              <li
                key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`}
                className="flex items-center gap-3"
              >
                {/* Imagen del producto con badge de cantidad */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg border border-border"
                  />
                  {/* Badge de cantidad en la esquina superior derecha */}
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>

                {/* Nombre y precio */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  {/* Variantes seleccionadas (Color: Rojo, Talla: M, etc.) */}
                  {Object.entries(item.selectedVariants).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>

                <p className="text-sm font-semibold text-foreground flex-shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          {/* Línea separadora */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span className="text-success font-medium">A calcular</span>
            </div>
            <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}
