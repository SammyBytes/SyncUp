import e from "cors";
import { env } from "../../config/Env";
import { logger } from "../../config/Logger";
import { generateState } from "../../helpers/Auth";
import { RedisStore } from "../../stores/RedisStore";
import { Err, Ok, type Result } from "../../helpers/Result";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * ClickUp OAuth Client ID from environment variables.
 */
const clickupClientId = env.CLICKUP_ID_CLIENT;
/**
 * Redirect URI for ClickUp OAuth, constructed from environment variables.
 */
const redirectUri = encodeURIComponent(
  `${env.HOST}:${env.PORT}/api/v1/clickup/auth`
);

/**
 * Store to keep track of generated states for OAuth flow.
 * States expire after 5 minutes (300 seconds).
 */
const stateStore = new RedisStore<{ state: string }>(
  120 // 2 min
);

type ConnectResponseResult = Result<
  string,
  { message: string; status: ContentfulStatusCode }
>;

/**
 * Generates the ClickUp OAuth authorization URL with a unique state parameter.
 * @returns The ClickUp OAuth authorization URL with state parameter.
 */
const execute = (): ConnectResponseResult => {
  try {
    const state = generateState();
    stateStore.set(state, { state });
    return Ok(
      `https://app.clickup.com/api/v1/oauth/authorize?client_id=${clickupClientId}&redirect_uri=${redirectUri}&state=${state}`
    );
  } catch (error: any) {
    if (error instanceof Error) {
      logger.error("Error generating ClickUp auth URL: " + error.message);
      return Err({
        message: "Failed to generate ClickUp auth URL",
        status: 500,
      });
    }

    logger.error("Unknown error generating ClickUp auth URL");
    return Err({ message: "Failed to generate ClickUp auth URL", status: 500 });
  }
};

export const GenerateAuthUrlUseCase = {
  execute,
};
