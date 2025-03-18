/*
  Warnings:

  - Added the required column `userId` to the `checklists` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_checklists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "checklists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_checklists" ("id", "name") SELECT "id", "name" FROM "checklists";
DROP TABLE "checklists";
ALTER TABLE "new_checklists" RENAME TO "checklists";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
