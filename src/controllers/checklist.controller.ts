import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createChecklistItemValidator,
  createChecklistValidator,
} from "../validators/checklist.validator.js";
import { jwt, type JwtVariables } from "hono/jwt";
import * as checklistRepository from "../repositories/checklist.repository.js";
import * as checklistItemRepository from "../repositories/checklist-item.repository.js";

const checklist = new Hono<{ Variables: JwtVariables<{ sub: number }> }>();

checklist.use(jwt({ secret: process.env.JWT_SECRET ?? "secret" }));

// checklist ======================================================================

checklist.post("/", zValidator("json", createChecklistValidator), async (c) => {
  const payload = c.req.valid("json");
  const { sub: userId } = c.get("jwtPayload");

  await checklistRepository.createChecklist(payload.name, userId);

  return c.json(
    { success: true, message: "Checklist created successfully" },
    201,
  );
});

checklist.get("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const checklists = await checklistRepository.findAllChecklist(userId);

  return c.json({ success: true, data: checklists });
});

checklist.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { sub: userId } = c.get("jwtPayload");

  await checklistRepository.deleteChecklist(Number(id), userId);

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

    await checklistItemRepository.createChecklistItem(
      payload.itemName,
      userId,
      Number(checklistId),
    );

    return c.json({ success: true, message: "Item created successfully" }, 201);
  },
);

checklist.get("/:id/item", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");

  const items = await checklistItemRepository.findAllChecklistItems(
    userId,
    Number(checklistId),
  );

  return c.json({ success: true, data: items });
});

checklist.get("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const item = await checklistItemRepository.findOneChecklistItem(
    Number(itemId),
    userId,
    Number(checklistId),
  );

  return c.json({ success: true, data: item });
});

checklist.put("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const item = await checklistItemRepository.findOneChecklistItem(
    Number(itemId),
    userId,
    Number(checklistId),
  );

  await checklistItemRepository.updateChecklistItem(item.id, {
    isDone: !item.isDone,
  });

  return c.json({ success: true, message: "Item status has been updated" });
});

checklist.delete("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const item = await checklistItemRepository.findOneChecklistItem(
    Number(itemId),
    userId,
    Number(checklistId),
  );

  await checklistItemRepository.deleteChecklistItem(item.id);

  return c.json({ success: true, message: "Item status has been deleted" });
});

checklist.put(
  "/:id/item/rename/:itemId",
  zValidator("json", createChecklistItemValidator),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const checklistId = c.req.param("id");
    const itemId = c.req.param("itemId");
    const payload = c.req.valid("json");

    const item = await checklistItemRepository.findOneChecklistItem(
      Number(itemId),
      userId,
      Number(checklistId),
    );

    await checklistItemRepository.updateChecklistItem(item.id, {
      itemName: payload.itemName,
    });

    return c.json({ success: true, message: "Item status has been renamed" });
  },
);

export default checklist;
