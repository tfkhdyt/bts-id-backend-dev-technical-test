import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import * as checklistItemRepository from "../repositories/checklist-item.repository.js";
import * as checklistRepository from "../repositories/checklist.repository.js";
import {
  createChecklistItemValidator,
  createChecklistValidator,
} from "../validators/checklist.validator.js";

const checklist = new Hono<{ Variables: JwtVariables<{ sub: number }> }>();

checklist.use(jwt({ secret: process.env.JWT_SECRET ?? "secret" }));

// checklist ======================================================================

// create
checklist.post("/", zValidator("json", createChecklistValidator), async (c) => {
  const payload = c.req.valid("json");
  const { sub: userId } = c.get("jwtPayload");

  await checklistRepository.createChecklist(payload.name, userId);

  return c.json(
    { success: true, message: "Checklist created successfully" },
    201
  );
});

// find all
checklist.get("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const checklists = await checklistRepository.findAllChecklist(userId);

  return c.json({ success: true, data: checklists });
});

// find one
checklist.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { sub: userId } = c.get("jwtPayload");

  await checklistRepository.deleteChecklist(Number(id), userId);

  return c.json({ success: true, message: "Checklist deleted successfully" });
});

// checklist item =================================================================

// create
checklist.post(
  "/:id/item",
  zValidator("json", createChecklistItemValidator),
  async (c) => {
    const payload = c.req.valid("json");
    const { sub: userId } = c.get("jwtPayload");
    const checklistId = c.req.param("id");

    const checkList = await checklistRepository.findOneChecklist(
      userId,
      Number(checklistId)
    );

    await checklistItemRepository.createChecklistItem(
      payload.itemName,
      userId,
      checkList.id
    );

    return c.json({ success: true, message: "Item created successfully" }, 201);
  }
);

// find all
checklist.get("/:id/item", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");

  const checkList = await checklistRepository.findOneChecklist(
    userId,
    Number(checklistId)
  );

  const items = await checklistItemRepository.findAllChecklistItems(
    userId,
    checkList.id
  );

  return c.json({ success: true, data: items });
});

// find one
checklist.get("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const checkList = await checklistRepository.findOneChecklist(
    userId,
    Number(checklistId)
  );

  const item = await checklistItemRepository.findOneChecklistItem(
    Number(itemId),
    userId,
    checkList.id
  );

  return c.json({ success: true, data: item });
});

// toggle status
checklist.put("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const checkList = await checklistRepository.findOneChecklist(
    userId,
    Number(checklistId)
  );

  const item = await checklistItemRepository.findOneChecklistItem(
    Number(itemId),
    userId,
    checkList.id
  );

  await checklistItemRepository.updateChecklistItem(item.id, {
    isDone: !item.isDone,
  });

  return c.json({ success: true, message: "Item status has been updated" });
});

// delete
checklist.delete("/:id/item/:itemId", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const checklistId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const checkList = await checklistRepository.findOneChecklist(
    userId,
    Number(checklistId)
  );

  const item = await checklistItemRepository.findOneChecklistItem(
    Number(itemId),
    userId,
    checkList.id
  );

  await checklistItemRepository.deleteChecklistItem(item.id);

  return c.json({ success: true, message: "Item status has been deleted" });
});

// rename
checklist.put(
  "/:id/item/rename/:itemId",
  zValidator("json", createChecklistItemValidator),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const checklistId = c.req.param("id");
    const itemId = c.req.param("itemId");
    const payload = c.req.valid("json");

    const checkList = await checklistRepository.findOneChecklist(
      userId,
      Number(checklistId)
    );

    const item = await checklistItemRepository.findOneChecklistItem(
      Number(itemId),
      userId,
      checkList.id
    );

    await checklistItemRepository.updateChecklistItem(item.id, {
      itemName: payload.itemName,
    });

    return c.json({ success: true, message: "Item status has been renamed" });
  }
);

export default checklist;
