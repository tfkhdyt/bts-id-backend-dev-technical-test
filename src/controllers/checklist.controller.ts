import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createChecklistItemValidator,
  createChecklistValidator,
} from "../validators/checklist.validator.js";
import { jwt, type JwtVariables } from "hono/jwt";
import { prisma } from "../lib/prisma.js";
import { HTTPException } from "hono/http-exception";

const checklist = new Hono<{ Variables: JwtVariables<{ sub: number }> }>();

checklist.use(jwt({ secret: process.env.JWT_SECRET ?? "secret" }));

// checklist ======================================================================

checklist.post("/", zValidator("json", createChecklistValidator), async (c) => {
  const payload = c.req.valid("json");
  const { sub: userId } = c.get("jwtPayload");

  await prisma.checklist.create({
    data: {
      name: payload.name,
      userId,
    },
  });

  return c.json(
    { success: true, message: "Checklist created successfully" },
    201,
  );
});

checklist.get("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const checklists = await prisma.checklist.findMany({
    where: {
      userId,
    },
  });

  return c.json({ success: true, data: checklists });
});

checklist.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { sub: userId } = c.get("jwtPayload");

  await prisma.checklist.delete({ where: { id: Number(id), userId } });

  return c.json({ success: true, message: "Checklist deleted successfully" });
});

// checklist item =================================================================

checklist.post(
  "/:id/item",
  zValidator("json", createChecklistItemValidator),
  async (c) => {
    const payload = c.req.valid("json");
    const { sub: userId } = c.get("jwtPayload");
    const checklistId = c.req.param("id");

    await prisma.item.create({
      data: {
        itemName: payload.itemName,
        userId,
        checklistId: Number(checklistId),
      },
    });

    return c.json({ success: true, message: "Item created successfully" }, 201);
  },
);

checklist.get("/:id/item", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");

  const items = await prisma.item.findMany({
    where: {
      userId,
      checklistId: Number(checklistId),
    },
  });

  return c.json({ success: true, data: items });
});

checklist.get("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const item = await prisma.item.findUnique({
    where: {
      userId,
      checklistId: Number(checklistId),
      id: Number(itemId),
    },
  });
  if (!item) {
    throw new HTTPException(404, { message: "Item is not found" });
  }

  return c.json({ success: true, data: item });
});

checklist.put("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const item = await prisma.item.findUnique({
    where: {
      userId,
      checklistId: Number(checklistId),
      id: Number(itemId),
    },
  });
  if (!item) {
    throw new HTTPException(404, { message: "Item is not found" });
  }

  await prisma.item.update({
    where: {
      id: item.id,
    },
    data: {
      isDone: !item.isDone,
    },
  });

  return c.json({ success: true, message: "Item status has been updated" });
});

checklist.delete("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const item = await prisma.item.findUnique({
    where: {
      userId,
      checklistId: Number(checklistId),
      id: Number(itemId),
    },
  });
  if (!item) {
    throw new HTTPException(404, { message: "Item is not found" });
  }

  await prisma.item.delete({
    where: {
      id: item.id,
    },
  });

  return c.json({ success: true, message: "Item status has been deleted" });
});

export default checklist;
