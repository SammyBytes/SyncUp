import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!"));

export default {
  fetch: app.fetch,
  port: 1234,
};
