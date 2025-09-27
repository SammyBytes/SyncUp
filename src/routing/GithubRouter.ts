import { Hono } from "hono";
import { verifySignature } from "../helpers/Auth";
import { EvaluateEvent } from "../validations/EventsValidations";
import { TaskResponseDto } from "../dtos/TaskResponseDto";
import { RepositoryResponseDto } from "../dtos/RepositoryResponseDto";

const githubRouter = new Hono();

githubRouter.post("/issues", async (c) => {
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

  if (!EvaluateEvent(event)) {
    return c.json({ message: "Event not supported" }, 400);
  }
  console.log("Event:", event);

  const rawPayload = await c.req.json().catch(() => null);
  if (!rawPayload) {
    return c.json({ message: "Invalid JSON payload" }, 400);
  }

  console.log("Raw Payload:", rawPayload);

  // Process the payload as needed
  const taskInfo = TaskResponseDto.create({
    id: rawPayload.issue?.id,
    title: rawPayload.issue?.title,
    body: rawPayload.issue?.body,
    draft: rawPayload.issue?.draft,
    url: rawPayload.issue?.html_url,
    state: rawPayload.issue?.state,
  });

  console.log("Processed Payload:", taskInfo);

  const repositoryInfo = RepositoryResponseDto.create({
    id: rawPayload.repository?.id,
    name: rawPayload.repository?.name,
    full_name: rawPayload.repository?.full_name,
    html_url: rawPayload.repository?.html_url,
  });

  console.log("Processed Repository Info:", repositoryInfo);

  return c.json({ message: "Event received" }, 202);
});

export default githubRouter;
