-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checklistId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "checklists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_items" ("checklistId", "id", "itemName", "userId") SELECT "checklistId", "id", "itemName", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
