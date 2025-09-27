import { Hono } from "hono";

const githubRouter = new Hono();

githubRouter.get("/", (c) => c.text("Hello Webhook!"));

export default githubRouter;
