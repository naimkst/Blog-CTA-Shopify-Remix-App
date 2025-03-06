/*
  Warnings:

  - You are about to drop the column `productImage` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `productSlug` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `productTitle` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Item` table. All the data in the column will be lost.
  - Added the required column `headline` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `layout` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "description" TEXT,
    "productId" TEXT,
    "productHandle" TEXT,
    "blogId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "categoryId" TEXT,
    "productsId" TEXT,
    "layout" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "thumbnail" TEXT,
    "buttonLink" TEXT,
    "buttonText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Item" ("blogId", "createdAt", "id", "position", "productId", "updatedAt") SELECT "blogId", "createdAt", "id", "position", "productId", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
