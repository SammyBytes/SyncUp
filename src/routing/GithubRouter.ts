import { Hono } from "hono";
import { verifySignature } from "../helpers/Auth";
import {
  EvaluateAction,
  EvaluateEvent,
} from "../validations/EventsValidations";
import { TaskResponseDto } from "../dtos/TaskResponseDto";
import { RepositoryResponseDto } from "../dtos/RepositoryResponseDto";
import { create } from "../services/TaskServices";
import { RedisStore } from "../stores/RedisStore";
import { config } from "../Server";

const githubRouter = new Hono();

const tokenStore = new RedisStore<{ accessToken: string }>();

githubRouter.post("/issues", async (c) => {
  c.status(202);
  const sigHeader = c.req.header("x-hub-signature-256");
  const rawBody = await c.req.text();
  const event = c.req.header("x-github-event");

  if (!sigHeader || !rawBody || !event) {
    console.error("Missing required headers or body");
    return c.json({ message: "Missing required headers or body" }, 400);
  }

  // Verify the signature
  const isValid = verifySignature(
    Bun.env.SECRETY as string,
    rawBody,
    sigHeader
  );
  if (!isValid) {
    console.error("Invalid signature");
    return c.json({ message: "Invalid signature" }, 401);
  }

  if (!EvaluateEvent(event)) {
    console.error("Event not supported");
    return c.json({ message: "Event not supported" }, 400);
  }

  console.log("Event:", event);

  const rawPayload = await c.req.json().catch(() => null);
  if (!rawPayload) {
    console.error("Invalid JSON payload");
    return c.json({ message: "Invalid JSON payload" }, 400);
  }

  console.log("Raw Payload:", rawPayload);

  if (!rawPayload.action || !EvaluateAction(rawPayload.action)) {
    console.error("Action not supported");
    return c.json({ message: "Action not supported" }, 400);
  }

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

  const repoSearch = repositoryInfo.full_name;

  const repoConfig = config.repos[repoSearch];

  if (!repoConfig) {
    console.error("Repository not configured for ClickUp integration");
    return c.json({ message: "Repository not configured" }, 400);
  }

  const listId = repoConfig.list_id;
  if (!listId) {
    console.error("ClickUp List ID not configured for this repository");
    return c.json(
      { message: "ClickUp List ID not configured for this repository" },
      500
    );
  }

  console.log(
    `Mapping found for repository ${repositoryInfo.full_name}: ${repoSearch} -> List ID: ${listId}`
  );

  // Retrieve the ClickUp token from the store
  const token = await tokenStore.get("clickup_token");

  if (!token) {
    console.error("No ClickUp token available");
    return c.json({ message: "No ClickUp token available" }, 500);
  }

  const taskInfoResult = await create(listId, taskInfo, token.accessToken);

  if (!taskInfoResult.ok) {
    console.error(
      "Error creating task in ClickUp:",
      await taskInfoResult.text()
    );
    return c.json({ message: "Error creating task in ClickUp" }, 500);
  }

  console.log("Task created successfully in ClickUp");

  return c.json({ message: "Event received" }, 202);
});

export default githubRouter;
