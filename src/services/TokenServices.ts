export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const params = new URLSearchParams();
  params.append("client_id", (Bun.env.CLICKUP_ID_CLIENT as string) || "");
  params.append(
    "client_secret",
    (Bun.env.CLICKUP_CLIENT_SECRET as string) || ""
  );
  params.append("code", code);

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
