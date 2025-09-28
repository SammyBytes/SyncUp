import { env } from "../../config/Env";
import { logger } from "../../config/Logger";
import { RepositoryResponseDto } from "../../dtos/RepositoryResponseDto";
import { TaskResponseDto } from "../../dtos/TaskResponseDto";
import { verifySignature } from "../../helpers/Auth";
import { Err, Ok, type Result } from "../../helpers/Result";
import { config } from "../../Server";
import { create } from "../../services/TaskServices";
import { RedisStore } from "../../stores/RedisStore";
import {
  EvaluateEvent,
  EvaluateAction,
} from "../../validations/EventsValidations";
import { GeneralSchema } from "../../validations/github/GeneralSchema";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const tokenStore = new RedisStore<{ accessToken: string }>();

type CreateTaskResult = Result<
  { message: string },
  { message: string; status: ContentfulStatusCode }
>;

const execute = async (
  sigHeader: string | undefined,
  rawBody: string,
  event: string | undefined
): Promise<CreateTaskResult> => {
  try {
    logger.info("Received GitHub webhook event");
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody as string);
    } catch (err) {
      logger.warn(`Failed to parse rawBody: ${rawBody}`);
      return Err({ message: "Invalid JSON payload", status: 400 });
    }

    const parsed = GeneralSchema.safeParse({
      headers: { signature: sigHeader, event },
      payload: payload,
    });
    if (!parsed.success) {
      logger.warn(
        `Validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
      );
      return Err({
        message: parsed.error.issues?.[0]?.message ?? "Invalid request",
        status: 400,
      });
    }

    const { headers, payload: data } = parsed.data;

    const isValid = verifySignature(
      env.WEBHOOK_SECRET,
      rawBody,
      headers.signature
    );

    if (!isValid) {
      logger.warn(
        `Signature verification failed for payload: ${JSON.stringify(data)}`
      );
      return Err({ message: "Invalid signature", status: 401 });
    }

    if (!EvaluateEvent(headers.event)) {
      logger.warn(`Event not supported: ${headers.event}`);
      return Err({ message: "Event not supported", status: 400 });
    }
    if (!EvaluateAction(data.action)) {
      logger.warn(`Action not supported: ${data.action}`);
      return Err({ message: "Action not supported", status: 400 });
    }

    if (!data.issue || !data.repository)
      return Err({ message: "Incomplete payload", status: 400 });

    const taskInfo = TaskResponseDto.create(data.issue);
    const repositoryInfo = RepositoryResponseDto.create(data.repository);

    const repoConfig = config.repos[repositoryInfo.full_name];
    if (!repoConfig) {
      logger.warn(`Repository not configured: ${repositoryInfo.full_name}`);
      return Err({ message: "Repository not configured", status: 400 });
    }

    const token = await tokenStore.get("clickup_token");
    if (!token) {
      logger.warn("ClickUp not connected");
      return Err({ message: "ClickUp not connected", status: 400 });
    }

    const taskResult = await create(
      repoConfig.list_id,
      taskInfo,
      token.accessToken
    );
    if (!taskResult.ok) {
      logger.error(
        `Failed to create task in ClickUp: ${taskResult.status} - ${await taskResult.text()}`
      );
      return Err({ message: "Failed to create task in ClickUp", status: 500 });
    }
    logger.info(`Task created in ClickUp for issue ${taskInfo.title}`);
    return Ok({ message: "Task created successfully in ClickUp" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        "Error in CreateClickUpTaskFromGitHubUseCase: " + error.stack
      );
    } else {
      logger.error(
        "Error in CreateClickUpTaskFromGitHubUseCase: " + JSON.stringify(error)
      );
    }

    return Err({ message: "Internal server error", status: 500 });
  }
};

export const CreateClickUpTaskFromGitHubUseCase = {
  execute,
};
