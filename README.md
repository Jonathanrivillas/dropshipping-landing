# Sojo Trendy — E-commerce Dropshipping

Tienda online moderna y responsiva construida con React 19, TypeScript, Tailwind CSS v4 y Vite.

## 🚀 Stack Tecnológico

- **React 19** — Framework de UI
- **TypeScript** — Tipado estático
- **Tailwind CSS v4** — Estilos con sistema de tokens personalizados
- **Vite** — Build tool ultrarrápido
- **React Router v7** — Navegación SPA
- **React Hook Form + Zod** — Validación de formularios
- **json-server** — API simulada para desarrollo
- **react-helmet-async** — Meta tags dinámicos para SEO

## ✨ Características

### UX & Animaciones
- ⚡ **Animaciones de scroll profesionales** — Efectos visuales activados por IntersectionObserver
- 🎭 **Efectos parallax** — Elementos decorativos con movimiento parallax
- 🎨 **Micro-interacciones** — Hover glow, shimmer, press effects
- 📱 **Diseño totalmente responsivo** — Mobile-first, adaptado a todos los dispositivos
- 🌙 **Modo oscuro** — Toggle entre tema claro y oscuro

### E-commerce
- 🛍️ **Catálogo de productos** — Grid adaptativo con skeleton loaders
- 🔍 **Búsqueda global y filtros** — Búsqueda en navbar + filtros locales por categoría
- 📄 **Paginación** — Sistema de páginas (12 productos por página) con navegación anterior/siguiente
- 🏷️ **Variantes de producto** — Colores y tallas seleccionables
- 🛒 **Carrito de compras** — Drawer lateral con gestión completa del carrito
- 💳 **Checkout completo** — Formulario de envío y confirmación de pedidos

### SEO & Performance
- 🎯 **Meta tags dinámicos** — Open Graph, Twitter Cards, JSON-LD schema
- 🔗 **URLs canónicas** — SEO optimizado para cada página
- 🍞 **Breadcrumbs con schema markup** — Navegación jerárquica (Inicio > Categoría > Producto)
- 🚫 **noindex en páginas transaccionales** — Checkout y confirmación excluidos de indexación
- 📊 **Product schema markup** — Datos estructurados para productos
- 🌐 **Configuración social sharing** — Previews optimizados para redes sociales

### Desarrollo
- 📡 **API REST simulada** — json-server para desarrollo local
- 🔒 **TypeScript strict** — Tipado estricto en todo el código
- ♿ **Accesibilidad** — Respeta `prefers-reduced-motion`
- 🎯 **Variables de entorno** — Configuración centralizada con Vite

## 📋 Requisitos Previos

- Node.js 18+ 
- npm 9+

## 🛠️ Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd dropshipping-landing
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` y configura las variables necesarias:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SITE_URL=http://localhost:5174
   ```

## 🚦 Scripts Disponibles

### Modo Desarrollo

Para iniciar la aplicación en modo desarrollo, necesitas **dos terminales**:

**Terminal 1 — API simulada (json-server):**
```bash
npm run api
```
Inicia el servidor de API simulada en `http://localhost:3001`

**Terminal 2 — Aplicación React:**
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5174`

### Otros Scripts

```bash
npm run build    # Compila para producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecuta el linter
```

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── cart/        # Componentes del carrito
│   ├── icons/       # Componentes de iconos SVG
│   ├── product/     # Componentes de productos
│   └── ui/          # Componentes UI base (Button, Badge, etc.)
├── context/         # Contextos de React (CartContext)
├── data/            # Datos estáticos (si los hay)
├── hooks/           # Custom hooks
├── pages/           # Páginas/vistas principales
├── services/        # Servicios de API (productService, orderService)
├── styles/          # Tokens CSS y estilos globales
├── types/           # Definiciones de tipos TypeScript
└── App.tsx          # Componente raíz con routing
```

## 🌐 Variables de Entorno

El proyecto usa variables de entorno para configuración flexible:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3001` (dev)<br/>`https://api.sojotrendy.com` (prod) |
| `VITE_SITE_URL` | URL del sitio (para SEO) | `http://localhost:5174` (dev)<br/>`https://sojotrendy.com` (prod) |

⚠️ **Importante:** Solo las variables que comienzan con `VITE_` son expuestas al cliente.

## 🎨 Características

- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Carrito de compras persistente (localStorage)
- ✅ Proceso de checkout completo con validación
- ✅ Página de confirmación de orden
- ✅ Modo oscuro con persistencia
- ✅ Diseño totalmente responsivo
- ✅ Lazy loading de páginas
- ✅ Integración con API REST
- ✅ Manejo de estados de carga y errores

## � SEO & Optimización

El proyecto incluye optimizaciones completas para motores de búsqueda:

### Meta Tags Dinámicos
- ✅ **Open Graph** para redes sociales (Facebook, LinkedIn)
- ✅ **Twitter Cards** para compartir en Twitter
- ✅ **JSON-LD Schema** para productos con precios
- ✅ **Canonical URLs** para evitar contenido duplicado
- ✅ **Meta tags específicos** por página (título, descripción, imagen)

### Breadcrumbs (Migas de Pan)
- ✅ **Componente reutilizable** `<Breadcrumbs />` con schema markup JSON-LD
- ✅ **Aplicado en ProductDetailPage**: Inicio > Tienda > Categoría > Producto
- ✅ **Aplicado en CheckoutPage**: Inicio > Tienda > Checkout
- ✅ **Mejora SEO**: Google muestra las migas de pan en los resultados de búsqueda
- ✅ **Mejora UX**: Los usuarios entienden su ubicación en el sitio

### Archivos SEO
- ✅ **`public/sitemap.xml`** — Mapa del sitio con todas las páginas indexables
  - Homepage, tienda, categorías y productos individuales
  - Incluye imágenes y fechas de última modificación
  - Prioridades configuradas por tipo de página
  
- ✅ **`public/robots.txt`** — Directrices para crawlers
  - Permite indexación de páginas públicas
  - Bloquea páginas transaccionales (checkout, confirmación)
  - Referencia al sitemap.xml

⚠️ **Importante para producción:**
- Actualiza las URLs en `sitemap.xml` y `robots.txt` de `http://localhost:5174` a tu dominio real
- Configura `VITE_SITE_URL` en las variables de entorno de producción
- Envía el sitemap a Google Search Console y Bing Webmaster Tools

## �🚀 Despliegue

### Variables de Entorno en Producción

Antes de desplegar, configura las variables de entorno en tu plataforma:

**Vercel / Netlify:**
```env
VITE_API_URL=https://api.sojotrendy.com
VITE_SITE_URL=https://sojotrendy.com
```

### Build de Producción

```bash
npm run build
```

El build optimizado se genera en la carpeta `dist/`.

## � Backend API

El proyecto actualmente usa **json-server** para desarrollo local. Para producción, se requiere un backend real.

### Especificación Completa

Consulta **[API_SPECIFICATION.md](API_SPECIFICATION.md)** para la documentación completa que incluye:

- 📊 **Esquema de base de datos** (PostgreSQL)
- 🛤️ **Endpoints REST** (Products, Orders, Auth, Users)
- 🔐 **Autenticación y seguridad** (JWT, bcrypt, rate limiting)
- 🔄 **Flujos de negocio** (checkout, búsqueda, admin)
- 🚀 **Roadmap de implementación** (6 fases detalladas)
- 🏗️ **Stack tecnológico recomendado** (Node.js/Python/.NET)

### Archivos de Base de Datos

En la carpeta **`database/`** encontrarás:

- **`schema.sql`** — Script completo para crear todas las tablas en PostgreSQL
- **`migration.sql`** — Script para migrar los productos actuales de db.json

### Stack Recomendado

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticación

**Deployment:**
- Railway / Render (backend)
- Vercel / Netlify (frontend)
- AWS S3 / Cloudinary (imágenes)

### Migración desde json-server

La especificación incluye un plan de migración completo del `db.json` actual a PostgreSQL con:
- Scripts de migración de datos
- Endpoints compatibles con el frontend existente
- Mínimos cambios en `productService.ts` y `orderService.ts`

## �📄 Licencia

Este proyecto es privado y confidencial.

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
