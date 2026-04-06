// ============================================================
// CART DRAWER — Panel lateral del carrito
// ============================================================
// ReactDOM.createPortal renderiza el drawer directamente en
// el <body> para evitar problemas de z-index y overflow.
// ============================================================

import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { Button } from '../ui/Button';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

export function CartDrawer() {
    const { items, totalItems, totalPrice, isOpen, closeCart } = useCart();

    // Cierra el drawer con la tecla Escape — accesibilidad estándar
    // El return del useEffect elimina el listener al desmontar el componente
    // para evitar que se acumulen listeners (memory leak).
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) closeCart();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeCart]);

    const drawer = (
        <>
            {/* Overlay oscuro — clic fuera cierra el drawer */}
            <div
                className={[
                    'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Panel lateral */}
            <div
                role="dialog"
                aria-label="Carrito de compras"
                aria-modal="true"
                className={[
                    'fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-background shadow-2xl',
                    'flex flex-col transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full',
                ].join(' ')}
            >
                {/* ── HEADER ──────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} className="text-primary" />
                        <h2 className="font-bold text-foreground text-lg">
                            Carrito
                            {totalItems > 0 && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                                </span>
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer active:scale-90"
                        aria-label="Cerrar carrito"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── CONTENIDO ────────────────────────────────────── */}
                {items.length === 0 ? (
                    // Estado vacío
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 animate-fade-up">
                        <ShoppingBag size={64} className="text-muted-foreground/30" strokeWidth={1} />
                        <p className="font-semibold text-foreground">Tu carrito está vacío</p>
                        <p className="text-sm text-muted-foreground text-center">
                            Agrega productos para empezar a comprar
                        </p>
                        {/* Link estilizado como botón — evita anidar <a> dentro de <button> */}
                    <Link
                      to="/tienda"
                      onClick={closeCart}
                      className="inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 text-base mt-2"
                    >
                      Ver productos
                    </Link>
                    </div>
                ) : (
                    <>
                        {/* Lista de items con scroll */}
                        <div className="flex-1 overflow-y-auto px-5">
                            {items.map(item => (
                                <CartItem
                                    key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`}
                                    item={item}
                                />
                            ))}
                        </div>

                        {/* ── FOOTER CON TOTALES ───────────────────────── */}
                        <div className="border-t border-border px-5 py-5 space-y-4 bg-background">
                            <div className="space-y-2">
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

                            <Link to="/checkout" onClick={closeCart} className="block">
                                <Button variant="primary" size="lg" className="w-full">
                                    Proceder al pago →
                                </Button>
                            </Link>

                            <button
                                onClick={closeCart}
                                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );

    // createPortal: el drawer se renderiza en el <body>,
    // fuera del árbol de componentes normal.
    return createPortal(drawer, document.body);
}