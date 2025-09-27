import { Hono } from "hono";
import githubRouter from "./routing/GithubRouter";

const app = new Hono();

app.route("/webhook/github", githubRouter);

export default {
  fetch: app.fetch,
  port: 1234,
};
