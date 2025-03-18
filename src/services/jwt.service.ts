import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";

export async function createJwtToken(
  userId: number,
  expiredAtSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
) {
  try {
    const token = await sign(
      {
        sub: userId,
        exp: expiredAtSeconds,
      },
      process.env.JWT_SECRET ?? "secret",
    );

    return token;
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to create JWT token",
      cause: error,
    });
  }
}
