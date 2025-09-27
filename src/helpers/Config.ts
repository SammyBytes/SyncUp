import fs from "fs";
import path from "path";
/**
 * Interface representing the configuration for a repository.
 * Includes the ClickUp list ID associated with the repository.
 */
export interface RepoConfig {
  list_id: string;
}
/**
 * Interface representing the overall workspace configuration.
 * Maps repository names to their respective configurations.
 */
export interface WorkspaceConfig {
  repos: Record<string, RepoConfig>;
}

let config: WorkspaceConfig;

export function loadConfig(): WorkspaceConfig {
  if (!config) {
    const filePath = path.join(
      process.cwd(),
      "src/config/workspace-config.json"
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    config = JSON.parse(raw);
  }
  return config;
}
