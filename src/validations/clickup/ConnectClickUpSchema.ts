import { z } from "zod";

export const ConnectClickUpSchema = z.object({
  code: z.string().min(1, { message: "Missing code parameter" }),
  state: z.string().min(1, { message: "Missing state parameter" }),
});
