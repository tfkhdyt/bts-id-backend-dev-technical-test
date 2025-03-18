import { serve } from "@hono/node-server";
import { Hono } from "hono";
import auth from "./controllers/auth.controller.js";
import checklist from "./controllers/checklist.controller.js";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono().basePath("/api");

app.onError((err, c) => {
  console.error(err);

  let statusCode: ContentfulStatusCode = 500;
  if (err instanceof HTTPException) {
    statusCode = err.status;
  }

  return c.json(
    {
      success: false,
      message: err.message,
    },
    statusCode,
  );
});
app.route("", auth);
app.route("/checklist", checklist);

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
