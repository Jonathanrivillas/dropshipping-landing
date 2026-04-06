// ============================================================
// APP — Raíz de la aplicación
// ============================================================
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { useAdminAuth } from './hooks/useAdminAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { Toast } from './components/ui/Toast';
import { AdminLayout } from './components/admin/AdminLayout';

// ── Tienda pública ────────────────────────────────────────────────────────────
const HomePage              = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ShopPage              = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const ProductDetailPage     = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage          = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const PaymentResultPage     = lazy(() => import('./pages/PaymentResultPage').then(m => ({ default: m.PaymentResultPage })));

// ── Panel de administración ───────────────────────────────────────────────────
const AdminDashboardPage    = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminOrdersPage       = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage  = lazy(() => import('./pages/admin/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })));
const AdminProductsPage     = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductFormPage  = lazy(() => import('./pages/admin/AdminProductFormPage').then(m => ({ default: m.AdminProductFormPage })));
const AdminLoginPage        = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// Layout de la tienda pública (con Navbar, Footer, Carrito)
function StoreApp() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <Toast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                         element={<HomePage />} />
          <Route path="/tienda"                   element={<ShopPage />} />
          <Route path="/producto/:slug"           element={<ProductDetailPage />} />
          <Route path="/checkout"                 element={<CheckoutPage />} />
          <Route path="/confirmacion/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/pago/resultado"            element={<PaymentResultPage />} />
          <Route path="*"                         element={<Navigate to="/tienda" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

// Guard: redirige a /admin/login si no está autenticado
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

// Layout del panel de administración (sidebar propio, sin Navbar/Footer)
function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AdminLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/"                     element={<AdminDashboardPage />} />
                    <Route path="/pedidos"              element={<AdminOrdersPage />} />
                    <Route path="/pedidos/:id"          element={<AdminOrderDetailPage />} />
                    <Route path="/productos"            element={<AdminProductsPage />} />
                    <Route path="/productos/nuevo"      element={<AdminProductFormPage />} />
                    <Route path="/productos/:id/editar" element={<AdminProductFormPage />} />
                  </Routes>
                </Suspense>
              </AdminLayout>
            </RequireAuth>
          }
        />
      </Routes>
    </AdminAuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Rutas del admin — layout propio */}
          <Route path="/admin/*" element={<AdminApp />} />
          {/* Rutas de la tienda pública */}
          <Route path="/*" element={<StoreApp />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;