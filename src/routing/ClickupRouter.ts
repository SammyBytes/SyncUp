import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { exchangeCodeForToken } from "../services/TokenServices";
import { generateState } from "../helpers/Auth";

export const ClickupRouter = new Hono();

ClickupRouter.get("/auth", async (c) => {
  console.log("Clickup auth endpoint hit");
  const code = c.req.query("code");
  if (!code) {
    return c.json({ message: "Missing code parameter" }, 400);
  }

  try {
    const token = await exchangeCodeForToken(code);
  } catch (error) {
    console.error("Error during Clickup OAuth process:", error);
    return c.json({ message: "Internal server error" }, 500);
  }

  return c.json({ message: "Clickup Router works!" });
});

ClickupRouter.get("/connect", (c) => {
  const state = generateState();
  const clientId = Bun.env.CLICKUP_ID_CLIENT;
  const redirectUri = encodeURIComponent(
    "http://localhost:1234/api/v1/clickup/auth"
  );

  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
  const authUrl = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
  return c.redirect(authUrl);
});
