import { z } from "zod";
import { join } from "path";
/**
 * Zod schema for validating the workspace configuration structure.
 * Ensures that each repository has a valid ClickUp list ID.
 */
const configSchema = z.object({
  repos: z.record(
    z.string().min(1),
    z.object({
      list_id: z.string().min(1),
    })
  ),
});
const configPath = join(process.cwd(), "workspace-config.json");
const rawConfig = await Bun.file(configPath).json();

export const config = configSchema.safeParse(rawConfig);

if (!config.success) {
  console.error("Invalid workspace configuration:", config.error.format());
  process.exit(1);
}

export const workspaceConfig = config.data;
