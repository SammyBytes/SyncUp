import { Hono } from "hono";
import githubRouter from "./routing/GithubRouter";

const app = new Hono();

app.route("/webhook", githubRouter);

export default {
  fetch: app.fetch,
  port: 1234,
};
