import { zValidator } from "@hono/zod-validator";
import argon2 from "argon2";
import "dotenv/config";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import * as userRepository from "../repositories/user.repository.js";
import * as jwtService from "../services/jwt.service.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";

const auth = new Hono();

auth.post("/register", zValidator("json", registerValidator), async (c) => {
  const payload = c.req.valid("json");
  payload.password = await argon2.hash(payload.password);

  await userRepository.createUser(payload);

  return c.json(
    { success: true, message: "User registered successfully" },
    201
  );
});

auth.post("/login", zValidator("json", loginValidator), async (c) => {
  const payload = c.req.valid("json");

  const user = await userRepository.findUserByUsername(payload.username);
  const isValid = await argon2.verify(user.password, payload.password);

  if (!isValid) {
    throw new HTTPException(401, { message: "Password is not valid" });
  }

  const token = await jwtService.createJwtToken(user.id);

  return c.json({ success: true, data: { token } }, 201);
});

export default auth;
