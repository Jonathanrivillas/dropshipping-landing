-- ============================================================
-- MIGRACIÓN DE DATOS — db.json → PostgreSQL
-- ============================================================
-- Este script migra los productos existentes de db.json a PostgreSQL
-- Ejecutar DESPUÉS de crear el schema (schema.sql)
-- ============================================================

-- Limpiar datos existentes (solo para migración inicial)
TRUNCATE TABLE product_variants, product_images, products RESTART IDENTITY CASCADE;

-- ============================================================
-- INSERTAR PRODUCTOS
-- ============================================================

-- Producto 1: Camiseta Oversize Negra
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (1, 'camiseta-oversize-negra', 'Camiseta Oversize Negra', 
        'Camiseta de algodón 100% con corte oversize para un look urbano y cómodo. Perfecta para el día a día.',
        45000, 65000, 'Ropa', ARRAY['oversize', 'casual', 'unisex'], 50, true, '2026-03-01T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 0),
(1, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600', 1);

INSERT INTO product_variants (product_id, type, options) VALUES
(1, 'Talla', ARRAY['XS', 'S', 'M', 'L', 'XL']),
(1, 'Color', ARRAY['Negro', 'Blanco', 'Gris']);

-- Producto 2: Conjunto Deportivo Mujer
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (2, 'conjunto-deportivo-mujer', 'Conjunto Deportivo Mujer',
        'Set de top y licra de alto impacto con tela transpirable. Ideal para gym, yoga o running.',
        89000, 120000, 'Ropa', ARRAY['deportivo', 'gym', 'mujer'], 30, true, '2026-03-05T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(2, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(2, 'Talla', ARRAY['XS', 'S', 'M', 'L']),
(2, 'Color', ARRAY['Negro', 'Azul marino', 'Rosa']);

-- Producto 3: Gorra Snapback Bordada
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (3, 'gorra-snapback-bordada', 'Gorra Snapback Bordada',
        'Gorra de estilo urbano con bordado frontal y cierre ajustable snapback. Talla única.',
        38000, NULL, 'Accesorios', ARRAY['gorra', 'urbano', 'unisex'], 80, false, '2026-03-08T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(3, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(3, 'Color', ARRAY['Negro', 'Beige', 'Blanco']);

-- Producto 4: Mochila Minimalista 20L
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (4, 'mochila-minimalista', 'Mochila Minimalista 20L',
        'Mochila urbana de 20 litros con compartimento para portátil de 15". Diseño limpio y resistente al agua.',
        95000, 130000, 'Accesorios', ARRAY['mochila', 'trabajo', 'viaje'], 25, true, '2026-03-10T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(4, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(4, 'Color', ARRAY['Negro', 'Gris oscuro']);

-- Producto 5: Audífonos Inalámbricos Pro
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (5, 'audifonos-inalambricos-pro', 'Audífonos Inalámbricos Pro',
        'Audífonos Bluetooth 5.3 con cancelación de ruido activa, 30h de batería y estuche de carga incluido.',
        189000, 250000, 'Tecnología', ARRAY['audifonos', 'bluetooth', 'musica'], 15, true, '2026-03-12T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(5, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(5, 'Color', ARRAY['Negro', 'Blanco', 'Azul']);

-- Producto 6: Soporte de Escritorio para Celular
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (6, 'soporte-celular-escritorio', 'Soporte de Escritorio para Celular',
        'Soporte ajustable de aluminio compatible con todos los smartphones. Ángulo de 0 a 90 grados.',
        28000, NULL, 'Tecnología', ARRAY['accesorios-tech', 'escritorio', 'productividad'], 100, false, '2026-03-15T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(6, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600', 0);

-- Sin variantes para este producto

-- Producto 7: Lámpara LED de Ambiente
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (7, 'lampara-led-ambiente', 'Lámpara LED de Ambiente',
        'Lámpara táctil recargable con 3 niveles de iluminación. Perfecta para escritorio o mesa de noche.',
        55000, 75000, 'Hogar', ARRAY['lampara', 'decoracion', 'led'], 40, true, '2026-03-18T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(7, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(7, 'Color', ARRAY['Blanco', 'Madera natural']);

-- Producto 8: Organizador de Escritorio en Bambú
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (8, 'organizador-escritorio-bambu', 'Organizador de Escritorio en Bambú',
        'Set organizador de 5 piezas en bambú natural. Incluye porta-lápices, bandeja y separadores.',
        72000, NULL, 'Hogar', ARRAY['organizador', 'bambu', 'minimalista'], 20, false, '2026-03-20T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(8, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600', 0);

-- Sin variantes

-- Producto 9: Difusor de Aromas Ultrasónico
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (9, 'difusor-aromas-ultrasonico', 'Difusor de Aromas Ultrasónico',
        'Difusor de aceites esenciales con luz LED multicolor, temporizador y apagado automático. 300ml.',
        68000, 90000, 'Hogar', ARRAY['aromaterapia', 'bienestar', 'hogar'], 35, true, '2026-03-22T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(9, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(9, 'Color', ARRAY['Blanco', 'Negro']);

-- Producto 10: Riñonera Urbana
INSERT INTO products (id, slug, name, description, price, compare_at_price, category, tags, stock, featured, created_at)
VALUES (10, 'riñonera-urbana', 'Riñonera Urbana',
        'Riñonera de tela resistente con compartimentos organizados. Se usa en cintura o cruzada al pecho.',
        42000, NULL, 'Accesorios', ARRAY['riñonera', 'urbano', 'festival'], 60, false, '2026-03-25T00:00:00Z');

INSERT INTO product_images (product_id, url, position) VALUES
(10, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', 0);

INSERT INTO product_variants (product_id, type, options) VALUES
(10, 'Color', ARRAY['Negro', 'Caqui', 'Azul']);

-- ============================================================
-- RESETEAR SECUENCIAS
-- ============================================================
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('product_images_id_seq', (SELECT MAX(id) FROM product_images));
SELECT setval('product_variants_id_seq', (SELECT MAX(id) FROM product_variants));

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_images FROM product_images;
SELECT COUNT(*) as total_variants FROM product_variants;

SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY count DESC;

SELECT 
  p.name,
  p.price,
  p.stock,
  array_length(p.tags, 1) as tag_count,
  (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
  (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count
FROM products p
ORDER BY p.id;

-- ============================================================
-- NOTAS
-- ============================================================
-- Este script migra los 10 productos iniciales de db.json
-- Para agregar más productos, usa los endpoints POST /api/v1/products
-- o inserta directamente con el mismo patrón de INSERT statements
-- ============================================================
