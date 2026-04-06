-- ============================================================
-- SOJO TRENDY — Database Schema
-- ============================================================
-- PostgreSQL 14+
-- Este script crea todas las tablas necesarias para el backend
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsqueda full-text optimizada

-- ============================================================
-- TABLA: products
-- ============================================================
CREATE TABLE products (
  id                SERIAL PRIMARY KEY,
  slug              VARCHAR(255) UNIQUE NOT NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT NOT NULL,
  price             INTEGER NOT NULL CHECK (price >= 0),
  compare_at_price  INTEGER CHECK (compare_at_price >= 0),
  category          VARCHAR(100) NOT NULL,
  tags              TEXT[] DEFAULT '{}',
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured          BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Índice GIN para búsqueda en arrays (tags)
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Índice full-text search en nombre y descripción
CREATE INDEX idx_products_search ON products USING GIN(
  to_tsvector('spanish', name || ' ' || description)
);

-- ============================================================
-- TABLA: product_images
-- ============================================================
CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,
  alt_text    VARCHAR(255)
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_position ON product_images(product_id, position);

-- ============================================================
-- TABLA: product_variants
-- ============================================================
CREATE TABLE product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  options     TEXT[] NOT NULL
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- TABLA: orders
-- ============================================================
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  order_number     VARCHAR(50) UNIQUE NOT NULL,
  user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Customer info (desnormalizada para historicidad)
  customer_name    VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(20) NOT NULL,
  
  -- Shipping address
  address          TEXT NOT NULL,
  city             VARCHAR(100) NOT NULL,
  department       VARCHAR(100) NOT NULL,
  
  -- Totals (en centavos)
  subtotal         INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping_cost    INTEGER DEFAULT 0 CHECK (shipping_cost >= 0),
  total            INTEGER NOT NULL CHECK (total >= 0),
  
  -- Status
  status           VARCHAR(50) DEFAULT 'pending' 
                   CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method   VARCHAR(50) NOT NULL 
                   CHECK (payment_method IN ('card', 'transfer', 'cash')),
  payment_status   VARCHAR(50) DEFAULT 'pending' 
                   CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Timestamps
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- ============================================================
-- TABLA: order_items
-- ============================================================
CREATE TABLE order_items (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (por si el producto se elimina o cambia)
  product_name   VARCHAR(255) NOT NULL,
  product_image  TEXT,
  unit_price     INTEGER NOT NULL CHECK (unit_price >= 0),
  
  -- Selected variants (JSON)
  variants       JSONB DEFAULT '{}',
  
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal       INTEGER NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- TABLA: sessions (opcional - para JWT blacklist o refresh tokens)
-- ============================================================
CREATE TABLE sessions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Limpiar sesiones expiradas automáticamente (opcional)
-- Ejecutar periódicamente con un cron job:
-- DELETE FROM sessions WHERE expires_at < NOW();

-- ============================================================
-- TRIGGERS para updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCIÓN: Generar order_number automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  -- Formato: ORD-2026-000001
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Obtener el siguiente número secuencial para este año
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM orders
  WHERE order_number LIKE 'ORD-' || year_part || '-%';
  
  -- Formatear con padding de 6 dígitos
  new_number := 'ORD-' || year_part || '-' || LPAD(sequence_part::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DATOS DE EJEMPLO (opcional - para testing)
-- ============================================================

-- Usuario admin por defecto
-- Password: Admin123! (bcrypt hash con salt rounds = 10)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@sojotrendy.com', '$2b$10$rQ9pX.8YGpJKGnNhQlXXme2YqZ8QNvKJ0K6kT.pYH7JgJNvKJQzHi', 'Administrador', 'admin');

-- Categorías comunes (puedes crear una tabla separada después)
-- Por ahora, las categorías están hardcoded en el código

-- ============================================================
-- VISTAS ÚTILES (opcional)
-- ============================================================

-- Vista de productos con conteo de órdenes
CREATE OR REPLACE VIEW products_with_stats AS
SELECT 
  p.*,
  COUNT(DISTINCT oi.order_id) as times_ordered,
  COALESCE(SUM(oi.quantity), 0) as total_quantity_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id;

-- Vista de órdenes con detalles completos
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
  o.id,
  o.order_number,
  o.customer_name,
  o.customer_email,
  o.total,
  o.status,
  o.payment_status,
  o.created_at,
  COUNT(oi.id) as items_count,
  u.email as user_email
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN users u ON o.user_id = u.id
GROUP BY o.id, u.email;

-- ============================================================
-- PERMISOS (ajustar según tu configuración)
-- ============================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sojotrendy_api_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sojotrendy_api_user;

-- ============================================================
-- NOTAS DE MANTENIMIENTO
-- ============================================================
-- 1. Backups: Configurar pg_dump diario
-- 2. Vacuum: Ejecutar VACUUM ANALYZE semanalmente
-- 3. Logs: Rotar logs cada 7 días
-- 4. Sesiones expiradas: Limpiar con cron job diario
-- 5. Índices: Monitorear con pg_stat_user_indexes
-- ============================================================
