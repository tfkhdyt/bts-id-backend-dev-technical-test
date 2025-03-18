import type { Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../lib/prisma.js";

export async function createChecklistItem(
  itemName: string,
  userId: number,
  checklistId: number
) {
  try {
    await prisma.item.create({
      data: {
        itemName: itemName,
        userId,
        checklistId: checklistId,
      },
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to create new checklist item",
      cause: error,
    });
  }
}

export async function findAllChecklistItems(
  userId: number,
  checklistId: number
) {
  try {
    const items = await prisma.item.findMany({
      where: {
        userId,
        checklistId: checklistId,
      },
    });

    return items;
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to find all checklist items",
      cause: error,
    });
  }
}

export async function findOneChecklistItem(
  id: number,
  userId: number,
  checklistId: number
) {
  const item = await prisma.item.findUnique({
    where: {
      id,
      userId,
      checklistId: checklistId,
    },
  });
  if (!item) {
    throw new HTTPException(404, { message: "Item is not found" });
  }

  return item;
}

export async function updateChecklistItem(
  itemId: number,
  data: Prisma.ItemUpdateInput
) {
  try {
    await prisma.item.update({
      where: {
        id: itemId,
      },
      data,
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to update checklist item",
      cause: error,
    });
  }
}

export async function deleteChecklistItem(id: number) {
  try {
    await prisma.item.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to delete checklist item",
      cause: error,
    });
  }
}
