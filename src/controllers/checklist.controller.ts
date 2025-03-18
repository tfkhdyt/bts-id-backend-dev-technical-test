import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createChecklistValidator } from "../validators/checklist.validator.js";
import { jwt, type JwtVariables } from "hono/jwt";
import { prisma } from "../lib/prisma.js";

const checklist = new Hono<{ Variables: JwtVariables<{ sub: number }> }>();

checklist.use(jwt({ secret: process.env.JWT_SECRET ?? "secret" }));

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

export default checklist;
