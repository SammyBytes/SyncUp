import { z } from "zod";

export const HeadersSchema = z.object({
  signature: z
    .string()
    .min(1, { message: "Missing X-Hub-Signature-256 header" }),
  event: z.string().min(1, { message: "Missing X-GitHub-Event header" }),
});

export const PayloadSchema = z.object({
  action: z.string().min(1, { message: "Missing action in payload" }),
  issue: z
    .object({
      id: z.number().optional(),
      title: z.string().optional(),
      body: z.string().optional(),
      draft: z.boolean().optional(),
      html_url: z.string().url().optional(),
      state: z.string().optional(),
    })
    .optional(),
  repository: z
    .object({
      id: z.number().optional(),
      name: z.string().optional(),
      full_name: z.string().optional(),
      html_url: z.string().url().optional(),
    })
    .optional(),
});

export const GeneralSchema = z.object({
  headers: HeadersSchema,
  payload: PayloadSchema,
});
