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
  rawBody: unknown,
  event: string | undefined
): Promise<CreateTaskResult> => {
  try {
    const parsed = GeneralSchema.safeParse({
      headers: { signature: sigHeader, event },
      payload: rawBody,
    });
    if (!parsed.success) {
      return Err({
        message: parsed.error.issues?.[0]?.message ?? "Invalid request",
        status: 400,
      });
    }

    const { headers, payload } = parsed.data;

    const isValid = verifySignature(
      Bun.env.SECRETY as string,
      JSON.stringify(payload),
      headers.signature
    );

    if (!isValid) {
      return Err({ message: "Invalid signature", status: 401 });
    }

    if (!EvaluateEvent(headers.event))
      return Err({ message: "Event not supported", status: 400 });
    if (!EvaluateAction(payload.action))
      return Err({ message: "Action not supported", status: 400 });

    if (!payload.issue || !payload.repository)
      return Err({ message: "Incomplete payload", status: 400 });

    const taskInfo = TaskResponseDto.create(payload.issue);
    const repositoryInfo = RepositoryResponseDto.create(payload.repository);

    const repoConfig = config.repos[repositoryInfo.full_name];
    if (!repoConfig)
      return Err({ message: "Repository not configured", status: 400 });

    const token = await tokenStore.get("clickup_token");
    if (!token)
      return Err({ message: "No ClickUp token available", status: 500 });

    const taskResult = await create(
      repoConfig.list_id,
      taskInfo,
      token.accessToken
    );
    if (!taskResult.ok)
      return Err({ message: "Error creating task in ClickUp", status: 500 });

    return Ok({ message: "Task created successfully in ClickUp" });
  } catch (error) {
    logger.error(
      "Error in CreateClickUpTaskFromGitHubUseCase: " +
        (error instanceof Error ? error.toString() : String(error))
    );
    return Err({ message: "Internal server error", status: 500 });
  }
};

export const CreateClickUpTaskFromGitHubUseCase = {
  execute,
};
