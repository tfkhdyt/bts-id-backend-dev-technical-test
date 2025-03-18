import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import "dotenv/config";

const auth = new Hono();

auth.post("/register", zValidator("json", registerValidator), async (c) => {
  const payload = c.req.valid("json");
  payload.password = await argon2.hash(payload.password);

  await prisma.user.create({
    data: payload,
  });

  return c.json(
    { success: true, message: "User registered successfully" },
    201,
  );
});

auth.post("/login", zValidator("json", loginValidator), async (c) => {
  const payload = c.req.valid("json");

  const user = await prisma.user.findFirst({
    where: { username: payload.username },
  });
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  const isValid = await argon2.verify(user.password, payload.password);

  if (!isValid) {
    throw new HTTPException(401, { message: "Password is not valid" });
  }

  const token = await sign(
    {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Token expires in 7 days
    },
    process.env.JWT_SECRET ?? "secret",
  );

  return c.json({ success: true, data: { token } }, 201);
});

export default auth;
