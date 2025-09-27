import { Hono } from "hono";
import githubRouter from "./routing/GithubRouter";
import { ClickupRouter } from "./routing/ClickupRouter";

const app = new Hono();

app.route("/api/v1/webhook", githubRouter);
app.route("/api/v1/clickup", ClickupRouter);

export default {
  fetch: app.fetch,
  port: 1234,
};
