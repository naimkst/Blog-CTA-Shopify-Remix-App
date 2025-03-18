/*
  Warnings:

  - Added the required column `name` to the `Marketing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Marketing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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
    "articleId" TEXT,
    "articleTitles" TEXT,
    "status" TEXT,
    "customOptions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Marketing" ("articleId", "articleTitles", "blogId", "buttonLink", "buttonText", "categoryId", "createdAt", "description", "headline", "id", "layout", "position", "productHandle", "productsId", "shop", "status", "thumbnail", "updatedAt") SELECT "articleId", "articleTitles", "blogId", "buttonLink", "buttonText", "categoryId", "createdAt", "description", "headline", "id", "layout", "position", "productHandle", "productsId", "shop", "status", "thumbnail", "updatedAt" FROM "Marketing";
DROP TABLE "Marketing";
ALTER TABLE "new_Marketing" RENAME TO "Marketing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
