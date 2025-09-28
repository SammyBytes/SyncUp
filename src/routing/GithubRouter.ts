import { Hono } from "hono";
import { RedisStore } from "../stores/RedisStore";
import { CreateClickUpTaskFromGitHubUseCase } from "../useCases/github/CreateClickUpTaskFromGitHubUseCase";

const githubRouter = new Hono();

githubRouter.post("/issues", async (c) => {
  // Acknowledge receipt of the webhook immediately
  c.status(202);
  const sigHeader = c.req.header("x-hub-signature-256");
  const rawBody = await c.req.text();
  const event = c.req.header("x-github-event");

  const result = await CreateClickUpTaskFromGitHubUseCase.execute(
    sigHeader,
    rawBody,
    event
  );

  if (!result.ok) return c.json(result.error, result.error.status);

  return c.json(result.value, 202);
});

export default githubRouter;
