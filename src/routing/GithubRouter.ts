import { Hono } from "hono";

const githubRouter = new Hono();

githubRouter.post("/", (c) => {
  c.status(202);
  const githubEvent = c.req.header("x-github-event");
  if (!githubEvent) {
    return c.json({ message: "Missing X-GitHub-Event header" }, 400);
  }

  console.log(`Received GitHub event: ${githubEvent}`);
  return c.json({ message: "Event received" });
});

export default githubRouter;
