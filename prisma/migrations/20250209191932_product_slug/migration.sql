/*
  Warnings:

  - You are about to drop the column `productHandle` on the `Marketing` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Marketing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "productSlug" TEXT,
    "productId" TEXT NOT NULL,
    "productImage" TEXT,
    "productTitle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Marketing" ("createdAt", "id", "productId", "productImage", "productTitle", "title", "updatedAt") SELECT "createdAt", "id", "productId", "productImage", "productTitle", "title", "updatedAt" FROM "Marketing";
DROP TABLE "Marketing";
ALTER TABLE "new_Marketing" RENAME TO "Marketing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
