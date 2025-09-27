import { Hono } from "hono";
import { exchangeCodeForToken } from "../services/TokenServices";

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
