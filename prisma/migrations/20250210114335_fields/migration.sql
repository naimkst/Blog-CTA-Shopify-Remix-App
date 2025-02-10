/*
  Warnings:

  - Added the required column `blogId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productImage" TEXT,
    "productTitle" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "productSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Item" ("createdAt", "id", "productId", "productImage", "productSlug", "productTitle", "title", "updatedAt") SELECT "createdAt", "id", "productId", "productImage", "productSlug", "productTitle", "title", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
