// ============================================================
// PRODUCT SERVICE — Sojo Trendy
// ============================================================
// Esta es la única capa que sabe de dónde vienen los datos.
// Apunta al backend real en Express + PostgreSQL.
// El resto de la app no sabe nada de HTTP ni de la API.
// ============================================================

import type { Product } from '../types';
import { API_URL } from '../lib/api';

// ------------------------------------------------------------
// Devuelve todos los productos con stock disponible.
// Nuestro backend devuelve { products, total, page, ... }
// por eso extraemos .products antes de filtrar.
// ------------------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  // limit=100 trae todos los productos (catálogo pequeño)
  const response = await fetch(`${API_URL}/products?limit=100`);
  
  if (!response.ok) {
    throw new Error('Error al cargar los productos');
  }
  
  const data = await response.json();
  return (data.products as Product[]).filter(p => p.stock > 0);
}

// ------------------------------------------------------------
// Devuelve un producto por su slug (URL amigable).
// Ejemplo: "camiseta-oversize-negra" en vez de un ID críptico.
// Mejor para SEO y para que el usuario entienda la URL.
// ------------------------------------------------------------
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const response = await fetch(`${API_URL}/products/slug/${slug}`);
  
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error('Error al cargar el producto');
  }
  
  return await response.json() as Product;
}

// ------------------------------------------------------------
// Devuelve las categorías únicas del catálogo.
// Las derivamos en el frontend para no añadir un endpoint extra.
// ------------------------------------------------------------
export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  return Array.from(new Set(products.map(p => p.category)));
}

// ------------------------------------------------------------
// Devuelve solo los productos marcados como featured: true.
// ------------------------------------------------------------
export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products?limit=100`);
  
  if (!response.ok) {
    throw new Error('Error al cargar productos destacados');
  }
  
  const data = await response.json();
  return (data.products as Product[]).filter(p => p.featured && p.stock > 0);
}