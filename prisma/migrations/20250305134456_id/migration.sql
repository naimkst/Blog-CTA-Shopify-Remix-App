/*
  Warnings:

  - You are about to drop the column `productId` on the `Item` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "description" TEXT,
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
INSERT INTO "new_Item" ("blogId", "buttonLink", "buttonText", "categoryId", "createdAt", "description", "headline", "id", "layout", "position", "productHandle", "productsId", "shop", "thumbnail", "updatedAt") SELECT "blogId", "buttonLink", "buttonText", "categoryId", "createdAt", "description", "headline", "id", "layout", "position", "productHandle", "productsId", "shop", "thumbnail", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
