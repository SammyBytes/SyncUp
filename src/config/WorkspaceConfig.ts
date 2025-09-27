import { z } from "zod";

const configSchema = z.object({
  repos: z.record(
    z.string().min(1),
    z.object({
      list_id: z.string().min(1),
    })
  ),
});

const rawConfig = Bun.file("./src/config/workspace-config.json").json();

export const config = configSchema.safeParse(rawConfig);

if (!config.success) {
  console.error("Invalid workspace configuration:", config.error.format());
  process.exit(1);
}

export const workspaceConfig = config.data;
