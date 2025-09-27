import { logger } from "../../config/Logger";
import { RedisStore } from "../../stores/RedisStore";
import { Err, Ok, type Result } from "../../helpers/Result";
import { exchangeCodeForToken } from "../../services/TokenServices";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Store for ClickUp access tokens with no expiration.
 */
const tokenStore = new RedisStore<{ accessToken: string }>(3600 * 24 * 30); // 30 Days
/**
 * Store to keep track of generated states for OAuth flow.
 */
const stateStore = new RedisStore<{ state: string }>();

const clickupTokenName = "clickup_token";

type ConnectResult = Result<
  { message: string },
  { message: string; status: ContentfulStatusCode }
>;
/**
 * Executes the ClickUp OAuth connection process.
 * @param code - The authorization code received from ClickUp.
 * @param state - The state parameter to validate against stored state.
 * @returns A Result indicating success or failure of the connection process.
 */
const execute = async (
  code: string | undefined,
  state: string | undefined
): Promise<ConnectResult> => {
  if (!code)
    return {
      ok: false,
      error: { message: "Missing code parameter", status: 400 },
    };
  if (!state)
    return {
      ok: false,
      error: { message: "Missing state parameter", status: 400 },
    };

  const storedState = stateStore.get(state);
  if (!storedState)
    return {
      ok: false,
      error: { message: "Invalid or expired state parameter", status: 400 },
    };

  stateStore.delete(state); // prevent reuse

  try {
    const token = await exchangeCodeForToken(code);
    await tokenStore.set(clickupTokenName, { accessToken: token });
    return {
      ok: true,
      value: { message: "ClickUp connected successfully!" },
    };
  } catch (error: any) {
    logger.error("Error during ClickUp OAuth process:", error);
    return {
      ok: false,
      error: { message: "Internal server error", status: 500 },
    };
  }
};

export const ConnectClickUpAccountUseCase = {
  execute,
};
