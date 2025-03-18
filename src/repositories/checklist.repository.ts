import { HTTPException } from "hono/http-exception";
import { prisma } from "../lib/prisma.js";

export async function createChecklist(name: string, userId: number) {
  try {
    await prisma.checklist.create({
      data: {
        name,
        userId,
      },
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to create new checklist",
      cause: error,
    });
  }
}

export async function findAllChecklist(userId: number) {
  try {
    const checklists = await prisma.checklist.findMany({
      where: {
        userId,
      },
    });

    return checklists;
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to find all checklist",
      cause: error,
    });
  }
}

export async function deleteChecklist(id: number, userId: number) {
  try {
    await prisma.checklist.delete({ where: { id, userId } });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to delete checklist",
      cause: error,
    });
  }
}
