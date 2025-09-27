/**
 * Handles the exchange of an authorization code for an access token with ClickUp's OAuth2 service.
 * @param code - The authorization code received from ClickUp after user authorization.
 * @returns A promise that resolves to the access token string.
 * @throws An error if the token exchange fails.
 */
export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const params = buildParams(code);

  const response = await fetch("https://api.clickup.com/api/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Error exchanging code for token: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

const buildParams = (code: string): URLSearchParams => {
  const params = new URLSearchParams();
  params.append("client_id", Bun.env.CLICKUP_ID_CLIENT as string);
  params.append("client_secret", Bun.env.CLICKUP_CLIENT_SECRET as string);
  params.append("code", code);
  return params;
};
