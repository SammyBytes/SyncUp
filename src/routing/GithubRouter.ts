import { Hono } from "hono";
import { verifySignature } from "../helpers/Auth";

const githubRouter = new Hono();

githubRouter.post("/", async (c) => {
  c.status(202);
  const sigHeader = c.req.header("x-hub-signature-256");
  const rawBody = await c.req.text();
  const event = c.req.header("x-github-event");

  if (!sigHeader || !rawBody || !event) {
    return c.json({ message: "Missing required headers or body" }, 400);
  }

  // Verify the signature
  const isValid = verifySignature(
    Bun.env.SECRETY as string,
    rawBody,
    sigHeader
  );
  if (!isValid) {
    return c.json({ message: "Invalid signature" }, 401);
  }

  const payload = await c.req.json().catch(() => null);
  console.log("Event:", event);
  console.log("Payload:", payload);

  return c.json({ message: "Event received" }, 202);
});

export default githubRouter;
