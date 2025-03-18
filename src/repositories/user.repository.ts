import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HTTPException } from "hono/http-exception";

export async function createUser(payload: Prisma.UserCreateInput) {
  try {
    await prisma.user.create({
      data: payload,
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to create new user",
      cause: error,
    });
  }
}

export async function findUserByUsername(username: string) {
  const user = await prisma.user.findFirst({
    where: { username },
  });
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return user;
}
