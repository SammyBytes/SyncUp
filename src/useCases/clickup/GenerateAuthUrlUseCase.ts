import { env } from "../../config/Env";
import { generateState } from "../../helpers/Auth";
import { RedisStore } from "../../stores/RedisStore";

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

/**
 * Generates the ClickUp OAuth authorization URL with a unique state parameter.
 * @returns The ClickUp OAuth authorization URL with state parameter.
 */
export const execute = (): string => {
  try {
    const state = generateState();
    stateStore.set(state, { state });
    return `https://app.clickup.com/api/v1/oauth/authorize?client_id=${clickupClientId}&redirect_uri=${redirectUri}&state=${state}`;
  } catch (error) {
    console.error("Error generating auth URL:", error);
    throw new Error("Failed to generate ClickUp auth URL");
  }
};
