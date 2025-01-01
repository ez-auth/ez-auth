import type { OAuthVariables } from "@/lib/oauth/types";

import type { GitHubUser } from "./github-auth.type";

declare module "hono" {
  interface ContextVariableMap extends OAuthVariables {
    "user-github": Partial<GitHubUser> | undefined;
  }
}
