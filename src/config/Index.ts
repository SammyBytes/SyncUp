import { env } from "./Env";
import { workspaceConfig } from "./WorkspaceConfig";

export const config = {
  ...env,
  workspace: workspaceConfig,
};
