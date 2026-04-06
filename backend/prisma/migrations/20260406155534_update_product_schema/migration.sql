/*
  Warnings:

  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_number` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `images` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variants` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "order_number" TEXT NOT NULL,
ADD COLUMN     "payment_method" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "image_url",
ADD COLUMN     "compare_at_price" DOUBLE PRECISION,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "images" JSONB NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tags" JSONB NOT NULL,
ADD COLUMN     "variants" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
