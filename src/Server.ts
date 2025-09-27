import { Hono } from "hono";
import githubRouter from "./routing/GithubRouter";
import { ClickupRouter } from "./routing/ClickupRouter";
import { loadConfig } from "./helpers/Config";

const app = new Hono();

export const config = loadConfig();

app.route("/api/v1/webhook", githubRouter);
app.route("/api/v1/clickup", ClickupRouter);

export default {
  fetch: app.fetch,
  port: 1234,
};
