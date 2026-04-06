# API Backend — Especificación Técnica

> **Proyecto:** Sojo Trendy E-commerce  
> **Versión:** 1.0.0  
> **Fecha:** Abril 2026  
> **Autor:** Equipo de Desarrollo

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Base de Datos](#base-de-datos)
4. [Endpoints REST API](#endpoints-rest-api)
5. [Autenticación y Seguridad](#autenticación-y-seguridad)
6. [Flujos de Negocio](#flujos-de-negocio)
7. [Consideraciones de Producción](#consideraciones-de-producción)

---

## 1. Resumen Ejecutivo

### Objetivo
Migrar de **json-server** (desarrollo) a un backend de producción robusto que soporte:
- Gestión de productos con búsqueda y filtros
- Sistema de órdenes completo
- Autenticación de usuarios
- Panel administrativo
- Escalabilidad y seguridad

### Stack Tecnológico Recomendado

**Opción 1 — Node.js + Express (JavaScript/TypeScript)**
- ✅ Mismo lenguaje que frontend (TypeScript)
- ✅ Ecosistema rico (Prisma, TypeORM, Mongoose)
- ✅ Fácil despliegue (Vercel, Railway, Render)

**Opción 2 — Python + FastAPI**
- ✅ Tipado fuerte con Pydantic
- ✅ Documentación automática (OpenAPI/Swagger)
- ✅ Alto rendimiento (async/await)

**Opción 3 — .NET Core (C#)**
- ✅ Enterprise-grade, muy performante
- ✅ Entity Framework Core (ORM potente)
- ✅ Ideal para Azure deployment

### Base de Datos Recomendada
- **PostgreSQL** — Para producción (ACID, relaciones complejas, JSON support)
- **MongoDB** — Alternativa NoSQL si necesitas máxima flexibilidad

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│                    http://localhost:5174                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API REST (Backend)                       │
│                 http://api.sojotrendy.com                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Products   │  │    Orders    │  │     Auth     │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             ▼
                   ┌──────────────────┐
                   │   PostgreSQL DB  │
                   │   (Producción)   │
                   └──────────────────┘
```

### Capas de la Aplicación

1. **Capa de Presentación** — React Frontend
2. **Capa de API** — Express/FastAPI REST API
3. **Capa de Lógica de Negocio** — Services (Products, Orders, Users)
4. **Capa de Datos** — ORM (Prisma/TypeORM/SQLAlchemy)
5. **Capa de Persistencia** — PostgreSQL Database

---

## 3. Base de Datos

### Esquema de Tablas

#### 3.1. Tabla `products`

```sql
CREATE TABLE products (
  id                SERIAL PRIMARY KEY,
  slug              VARCHAR(255) UNIQUE NOT NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT NOT NULL,
  price             INTEGER NOT NULL,  -- En centavos (ej: 45000 = $45.000)
  compare_at_price  INTEGER,           -- Precio antes de descuento
  category          VARCHAR(100) NOT NULL,
  tags              TEXT[],            -- Array de strings
  stock             INTEGER NOT NULL DEFAULT 0,
  featured          BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  
  -- Índices
  INDEX idx_category (category),
  INDEX idx_featured (featured),
  INDEX idx_slug (slug)
);
```

#### 3.2. Tabla `product_images`

```sql
CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,  -- Orden de visualización
  alt_text    VARCHAR(255),
  
  INDEX idx_product_id (product_id)
);
```

#### 3.3. Tabla `product_variants`

```sql
CREATE TABLE product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,  -- "Talla", "Color"
  options     TEXT[] NOT NULL,       -- ["S", "M", "L", "XL"]
  
  INDEX idx_product_id (product_id)
);
```

#### 3.4. Tabla `users`

```sql
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,  -- bcrypt hash
  full_name      VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20) DEFAULT 'customer',  -- 'customer' | 'admin'
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_email (email)
);
```

#### 3.5. Tabla `orders`

```sql
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  order_number     VARCHAR(50) UNIQUE NOT NULL,  -- "ORD-2026-123456"
  user_id          INTEGER REFERENCES users(id),
  
  -- Información del cliente (desnormalizada para historicidad)
  customer_name    VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(20) NOT NULL,
  
  -- Dirección de envío
  address          TEXT NOT NULL,
  city             VARCHAR(100) NOT NULL,
  department       VARCHAR(100) NOT NULL,
  
  -- Totales
  subtotal         INTEGER NOT NULL,  -- Sin envío
  shipping_cost    INTEGER DEFAULT 0,
  total            INTEGER NOT NULL,
  
  -- Estado del pedido
  status           VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method   VARCHAR(50) NOT NULL,           -- 'card' | 'transfer'
  payment_status   VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'paid' | 'failed'
  
  -- Fechas
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order_number (order_number),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

#### 3.6. Tabla `order_items`

```sql
CREATE TABLE order_items (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id),
  
  -- Snapshot del producto (por si el producto se elimina o cambia de precio)
  product_name   VARCHAR(255) NOT NULL,
  product_image  TEXT,
  unit_price     INTEGER NOT NULL,
  
  -- Variantes seleccionadas (JSON)
  variants       JSONB,  -- {"Talla": "M", "Color": "Negro"}
  
  quantity       INTEGER NOT NULL DEFAULT 1,
  subtotal       INTEGER NOT NULL,  -- unit_price * quantity
  
  INDEX idx_order_id (order_id)
);
```

#### 3.7. Tabla `sessions` (Opcional — para JWT blacklist o refresh tokens)

```sql
CREATE TABLE sessions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         VARCHAR(500) UNIQUE NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);
```

### Relaciones

```
users ─┬─< orders ─< order_items >─ products
       │
       └─< sessions

products ─┬─< product_images
          └─< product_variants
```

---

## 4. Endpoints REST API

### Base URL
- **Desarrollo:** `http://localhost:3001/api/v1`
- **Producción:** `https://api.sojotrendy.com/api/v1`

---

### 4.1. Products — Gestión de Productos

#### `GET /api/v1/products`
**Listar todos los productos con filtros opcionales**

**Query Parameters:**
```typescript
{
  category?: string;      // "Ropa", "Accesorios", etc.
  search?: string;        // Búsqueda en nombre/descripción/tags
  featured?: boolean;     // true = solo destacados
  minPrice?: number;      // Precio mínimo
  maxPrice?: number;      // Precio máximo
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'relevance';
  page?: number;          // Página actual (default: 1)
  limit?: number;         // Items por página (default: 12, max: 100)
}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "camiseta-oversize-negra",
      "name": "Camiseta Oversize Negra",
      "description": "Camiseta de algodón 100%...",
      "price": 45000,
      "compareAtPrice": 65000,
      "images": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"
      ],
      "category": "Ropa",
      "tags": ["oversize", "casual", "unisex"],
      "variants": [
        { "type": "Talla", "options": ["XS", "S", "M", "L", "XL"] },
        { "type": "Color", "options": ["Negro", "Blanco", "Gris"] }
      ],
      "stock": 50,
      "featured": true,
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

---

#### `GET /api/v1/products/:id`
**Obtener un producto por ID**

**Response 200:**
```json
{
  "id": 1,
  "slug": "camiseta-oversize-negra",
  "name": "Camiseta Oversize Negra",
  "description": "Descripción completa...",
  "price": 45000,
  "compareAtPrice": 65000,
  "images": ["url1", "url2"],
  "category": "Ropa",
  "tags": ["oversize", "casual"],
  "variants": [...],
  "stock": 50,
  "featured": true,
  "createdAt": "2026-03-01T00:00:00Z"
}
```

**Response 404:**
```json
{
  "error": "Product not found"
}
```

---

#### `POST /api/v1/products` 🔒 **Admin only**
**Crear un nuevo producto**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "slug": "producto-nuevo",
  "name": "Producto Nuevo",
  "description": "Descripción...",
  "price": 50000,
  "compareAtPrice": 70000,
  "category": "Tecnología",
  "tags": ["nuevo", "tech"],
  "variants": [
    { "type": "Color", "options": ["Negro", "Blanco"] }
  ],
  "stock": 30,
  "featured": false,
  "images": ["https://example.com/img1.jpg"]
}
```

**Response 201:**
```json
{
  "id": 11,
  "slug": "producto-nuevo",
  "name": "Producto Nuevo",
  ...
}
```

---

#### `PUT /api/v1/products/:id` 🔒 **Admin only**
**Actualizar un producto existente**

**Request Body:** (todos los campos son opcionales)
```json
{
  "price": 48000,
  "stock": 25,
  "featured": true
}
```

**Response 200:** Producto actualizado

---

#### `DELETE /api/v1/products/:id` 🔒 **Admin only**
**Eliminar un producto**

**Response 204:** No content

---

### 4.2. Orders — Gestión de Pedidos

#### `POST /api/v1/orders`
**Crear una nueva orden**

**Request Body:**
```json
{
  "customerInfo": {
    "fullName": "Juan García",
    "email": "juan@example.com",
    "phone": "3001234567",
    "address": "Calle 123 #45-67",
    "city": "Bogotá",
    "department": "Cundinamarca"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "variants": { "Talla": "M", "Color": "Negro" }
    },
    {
      "productId": 5,
      "quantity": 1,
      "variants": {}
    }
  ],
  "paymentMethod": "card"
}
```

**Response 201:**
```json
{
  "id": 42,
  "orderNumber": "ORD-2026-000042",
  "customerName": "Juan García",
  "customerEmail": "juan@example.com",
  "total": 224000,
  "status": "pending",
  "paymentStatus": "pending",
  "items": [
    {
      "productName": "Camiseta Oversize Negra",
      "productImage": "url...",
      "unitPrice": 45000,
      "quantity": 2,
      "variants": { "Talla": "M", "Color": "Negro" },
      "subtotal": 90000
    }
  ],
  "createdAt": "2026-04-01T10:30:00Z"
}
```

**Response 400:** (stock insuficiente, producto no encontrado, validación fallida)
```json
{
  "error": "Insufficient stock",
  "details": {
    "productId": 1,
    "requested": 5,
    "available": 3
  }
}
```

---

#### `GET /api/v1/orders/:orderNumber`
**Obtener una orden por número**

**Response 200:**
```json
{
  "id": 42,
  "orderNumber": "ORD-2026-000042",
  "customerName": "Juan García",
  "customerEmail": "juan@example.com",
  "customerPhone": "3001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "department": "Cundinamarca",
  "subtotal": 224000,
  "shippingCost": 0,
  "total": 224000,
  "status": "pending",
  "paymentMethod": "card",
  "paymentStatus": "pending",
  "items": [...],
  "createdAt": "2026-04-01T10:30:00Z"
}
```

---

#### `GET /api/v1/orders` 🔒 **Admin only**
**Listar todas las órdenes (panel admin)**

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  startDate?: string;  // ISO date
  endDate?: string;
  page?: number;
  limit?: number;
}
```

**Response 200:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

#### `PATCH /api/v1/orders/:id/status` 🔒 **Admin only**
**Actualizar estado de una orden**

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Response 200:** Orden actualizada

---

### 4.3. Auth — Autenticación

#### `POST /api/v1/auth/register`
**Registrar nuevo usuario**

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!",
  "fullName": "Juan García",
  "phone": "3001234567"
}
```

**Response 201:**
```json
{
  "user": {
    "id": 15,
    "email": "juan@example.com",
    "fullName": "Juan García",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400:**
```json
{
  "error": "Email already exists"
}
```

---

#### `POST /api/v1/auth/login`
**Iniciar sesión**

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "user": {
    "id": 15,
    "email": "juan@example.com",
    "fullName": "Juan García",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401:**
```json
{
  "error": "Invalid credentials"
}
```

---

#### `POST /api/v1/auth/logout` 🔒
**Cerrar sesión (invalidar token)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response 200:**
```json
{
  "message": "Logged out successfully"
}
```

---

#### `GET /api/v1/auth/me` 🔒
**Obtener usuario autenticado actual**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response 200:**
```json
{
  "id": 15,
  "email": "juan@example.com",
  "fullName": "Juan García",
  "phone": "3001234567",
  "role": "customer"
}
```

---

### 4.4. Users — Gestión de Usuarios

#### `GET /api/v1/users/me/orders` 🔒
**Obtener órdenes del usuario autenticado**

**Response 200:**
```json
{
  "data": [
    {
      "id": 42,
      "orderNumber": "ORD-2026-000042",
      "total": 224000,
      "status": "delivered",
      "createdAt": "2026-04-01T10:30:00Z"
    }
  ]
}
```

---

#### `PUT /api/v1/users/me` 🔒
**Actualizar perfil del usuario**

**Request Body:**
```json
{
  "fullName": "Juan García Pérez",
  "phone": "3009876543"
}
```

**Response 200:** Usuario actualizado

---

### 4.5. Categories — Categorías (Opcional)

Si las categorías crecen, considera una tabla separada:

#### `GET /api/v1/categories`
**Listar todas las categorías con conteo de productos**

**Response 200:**
```json
{
  "data": [
    {
      "name": "Ropa",
      "slug": "ropa",
      "productCount": 15
    },
    {
      "name": "Accesorios",
      "slug": "accesorios",
      "productCount": 8
    }
  ]
}
```

---

## 5. Autenticación y Seguridad

### 5.1. Estrategia de Autenticación

**JWT (JSON Web Tokens)**

- **Access Token:** 15 minutos de expiración
- **Refresh Token:** 7 días de expiración (almacenado en httpOnly cookie)
- **Algoritmo:** HS256 o RS256
- **Secret:** Variable de entorno `JWT_SECRET`

**Flujo de Login:**
```
1. POST /api/v1/auth/login
2. Backend valida credenciales (bcrypt para password)
3. Genera JWT con payload: { userId, email, role, exp }
4. Retorna token al cliente
5. Cliente almacena token (localStorage o memoria)
6. Todas las peticiones protegidas incluyen: Authorization: Bearer <token>
```

### 5.2. Middleware de Autenticación

```typescript
// Pseudocódigo
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { userId, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 5.3. Middleware de Autorización

```typescript
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}
```

### 5.4. Seguridad de Contraseñas

- **Hashing:** bcrypt con salt rounds = 10
- **Validación:** Mínimo 8 caracteres, 1 mayúscula, 1 número
- **No almacenar plaintext** nunca

```typescript
import bcrypt from 'bcrypt';

// Al registrar
const passwordHash = await bcrypt.hash(password, 10);

// Al validar login
const isValid = await bcrypt.compare(password, user.passwordHash);
```

### 5.5. Rate Limiting

Proteger contra ataques de fuerza bruta:

```typescript
// express-rate-limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,  // Máximo 5 intentos
  message: 'Too many login attempts, try again later'
});

app.post('/api/v1/auth/login', loginLimiter, loginHandler);
```

### 5.6. CORS

Configurar CORS apropiadamente:

```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://sojotrendy.com' 
    : 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### 5.7. Variables de Entorno

```env
# .env (Backend)
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sojotrendy

# JWT
JWT_SECRET=super-secret-key-change-in-production-256-bits
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://sojotrendy.com,https://www.sojotrendy.com

# Payment Gateway (futuro)
STRIPE_SECRET_KEY=sk_test_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...

# Email (futuro)
SMTP_HOST=smtp.gmail.com
SMTP_USER=notificaciones@sojotrendy.com
SMTP_PASS=app-specific-password
```

---

## 6. Flujos de Negocio

### 6.1. Flujo de Compra (Checkout)

```
1. Usuario agrega productos al carrito (frontend, localStorage)
2. Usuario va a /checkout
3. Usuario llena formulario de envío
4. Frontend valida datos con react-hook-form + zod
5. Frontend hace POST /api/v1/orders con:
   - customerInfo
   - items (productId, quantity, variants)
   - paymentMethod
6. Backend valida:
   - Productos existen
   - Stock suficiente
   - Precios correctos (anti-tampering)
7. Backend crea orden en estado "pending"
8. Backend reduce stock de productos
9. Backend retorna orderNumber
10. Frontend limpia carrito
11. Frontend redirige a /confirmacion/:orderNumber
12. (Futuro) Backend envía email de confirmación
13. (Futuro) Webhook de pasarela de pago actualiza paymentStatus
```

### 6.2. Flujo de Búsqueda

```
1. Usuario escribe en SearchBar (Navbar)
2. Usuario presiona Enter
3. Frontend navega a /tienda?q=camiseta
4. ShopPage se monta, lee ?q= de URL
5. Frontend hace GET /api/v1/products?search=camiseta&page=1&limit=12
6. Backend busca en campos: name, description, tags (ILIKE '%camiseta%')
7. Backend retorna productos + paginación
8. Frontend renderiza grid con resultados
```

### 6.3. Flujo de Admin

```
1. Admin hace login en /admin/login
2. Backend valida role === 'admin'
3. Frontend almacena token con role
4. Admin navega a /admin/products
5. Frontend hace GET /api/v1/products (sin filtros, muestra todos)
6. Admin crea/edita producto
7. Frontend hace POST/PUT /api/v1/products con Authorization header
8. Backend valida token + role
9. Backend guarda cambios
10. Frontend actualiza lista en tiempo real
```

---

## 7. Consideraciones de Producción

### 7.1. Optimizaciones

**Caché**
- Redis para productos más visitados
- Cache-Control headers en respuestas
- CDN para imágenes (Cloudinary, AWS S3 + CloudFront)

**Índices de Base de Datos**
- Ya definidos en schema (category, slug, email, order_number)
- Índice full-text search en products.name + description

**Conexión a DB**
- Connection pooling (pg-pool, Prisma connection pool)
- Max connections: 20-50 según carga

### 7.2. Monitoreo y Logs

**Logging**
- Winston / Pino para structured logging
- Levels: error, warn, info, debug
- Log rotation (1 archivo por día, retener 30 días)

**Métricas**
- Prometheus + Grafana
- Métricas clave:
  - Request duration (p50, p95, p99)
  - Error rate
  - Órdenes por hora
  - Revenue

**Error Tracking**
- Sentry para capturar excepciones
- Alertas en Slack/Email para errores críticos

### 7.3. Backups

- **Backup diario** de PostgreSQL (pg_dump)
- **Retention:** 7 días diarios, 4 semanales, 3 mensuales
- **Backup de archivos** si hay uploads (S3 versioning)
- **Disaster recovery plan:** Documentar proceso de restauración

### 7.4. CI/CD

**Pipeline de Despliegue:**
```
1. Commit a main → GitHub Actions se dispara
2. Run tests (unit + integration)
3. Build Docker image
4. Push to registry (Docker Hub, AWS ECR)
5. Deploy to staging
6. Run smoke tests
7. Manual approval para production
8. Deploy to production (zero-downtime con blue-green)
9. Run post-deployment tests
10. Notificación a Slack
```

### 7.5. Testing

**Unit Tests**
- Jest / Vitest
- Coverage mínimo: 80%
- Tests de servicios (ProductService, OrderService)

**Integration Tests**
- Supertest para endpoints
- Base de datos de test (SQLite in-memory o PostgreSQL dedicado)

**E2E Tests**
- Playwright / Cypress
- Flujo crítico: Registro → Compra → Confirmación

---

## 8. Roadmap de Implementación

### Fase 1 — MVP Backend (2-3 semanas)
- [ ] Setup proyecto (Express/FastAPI + TypeScript)
- [ ] Configurar PostgreSQL + ORM (Prisma/TypeORM)
- [ ] Implementar Products endpoints (GET /products, GET /products/:id)
- [ ] Implementar Orders endpoints (POST /orders, GET /orders/:orderNumber)
- [ ] Migrar datos de db.json a PostgreSQL
- [ ] Actualizar frontend para usar API real
- [ ] Deploy a staging (Railway/Render)

### Fase 2 — Autenticación (1-2 semanas)
- [ ] Implementar Auth endpoints (register, login, logout)
- [ ] JWT middleware
- [ ] Role-based access control
- [ ] Protected routes en frontend

### Fase 3 — Panel Admin (2 semanas)
- [ ] CRUD completo de productos (admin)
- [ ] Dashboard de órdenes
- [ ] Actualización de estados de órdenes
- [ ] Estadísticas básicas (ventas, productos top)

### Fase 4 — Mejoras y Optimización (1-2 semanas)
- [ ] Caché con Redis
- [ ] Full-text search optimizado
- [ ] Rate limiting
- [ ] Logs estructurados
- [ ] Monitoreo (Sentry + métricas)

### Fase 5 — Pasarela de Pago (2-3 semanas)
- [ ] Integración con Stripe o MercadoPago
- [ ] Webhooks de confirmación de pago
- [ ] Estados de pago en órdenes
- [ ] Email de confirmación (SendGrid/Resend)

### Fase 6 — Producción (1 semana)
- [ ] Setup dominio y SSL
- [ ] Configurar CDN para assets
- [ ] Backups automatizados
- [ ] CI/CD pipeline completo
- [ ] Documentación completa
- [ ] Load testing (k6, Artillery)

---

## 9. Recursos y Referencias

### Documentación
- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [Stripe API](https://stripe.com/docs/api)

### Boilerplates Recomendados
- [node-express-typescript-boilerplate](https://github.com/w3tecch/express-typescript-boilerplate)
- [prisma-express-typescript-starter](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-express)

### Herramientas
- **Postman/Insomnia** — Testing de API
- **DBeaver/pgAdmin** — GUI para PostgreSQL
- **Docker Desktop** — Contenedores locales
- **Railway/Render** — Hosting simple para MVP

---

## 10. Preguntas Frecuentes

**¿Necesito autenticación desde el día 1?**
- No necesariamente. Puedes lanzar con checkout sin registro (guest checkout) y agregar autenticación después.

**¿Qué pasarela de pago recomiendan?**
- **MercadoPago** si tu target es LATAM (acepta PSE, Efecty, etc.)
- **Stripe** si vas global (mejor documentación, más features)
- **PayU** alternativa para Colombia

**¿Puedo usar MongoDB en vez de PostgreSQL?**
- Sí, pero perderás transacciones ACID y relaciones fuertes. Para e-commerce, PostgreSQL es más seguro.

**¿Cómo manejar imágenes grandes?**
- No almacenarlas en la DB, usar CDN externo:
  - Upload a S3/Cloudinary
  - Guardar solo la URL en products.images

**¿Necesito Redis desde el inicio?**
- No, empieza sin caché. Agrega Redis cuando notes lentitud en queries frecuentes.

---

**Fin de la Especificación**

> 📌 **Próximo paso:** Revisar esta especificación con el equipo, decidir stack tecnológico y comenzar Fase 1 del roadmap.
