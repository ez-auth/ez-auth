import type { OAuthVariables } from "@/lib/oauth/types";

import type { GoogleUser } from "./google-auth.type";

declare module "hono" {
  interface ContextVariableMap extends OAuthVariables {
    "user-google": Partial<GoogleUser> | undefined;
  }
}
