import { Hono } from "hono";
import { getConnInfo } from "hono/bun";
import { getCookie } from "hono/cookie";

import { configService } from "@/config/config.service";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { googleAuthMiddleware } from "@/lib/oauth/google/google-auth.middleware";
import type { GoogleUser } from "@/lib/oauth/google/google-auth.type";
import { OAuthProvider } from "@/types/user.type";
import { handleOAuthUsecase } from "@/usecases";

const route = new Hono();
const config = configService.getConfig();

route.use(
  "/*",
  googleAuthMiddleware({
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
    scope: ["openid", "email", "profile"],
    redirect_uri: `${config.API_URL}/api/oauth/google/callback`,
  }),
);

route.get("/callback", async (c) => {
  const user = c.get("user-google") as Partial<GoogleUser> | undefined;
  const state = getCookie(c, "state");

  const { clientRedirectUrl } = JSON.parse(state ?? "{}");

  if (!user || !user.id) {
    throw new UsecaseError(ApiCode.InvalidCredentials);
  }

  const response = await handleOAuthUsecase.execute({
    provider: OAuthProvider.Google,
    providerId: user.id,
    providerEmail: user.email,
    providerData: { user, granted_scopes: c.get("granted-scopes") },
    ipAddress: getConnInfo(c).remote.address,
    userAgent: c.req.header("User-Agent"),
  });

  return c.redirect(
    `${clientRedirectUrl ?? config.CLIENT_REDIRECT_URL}?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}&sessionId=${response.sessionId}`,
  );
});

export const oauthGoogleRoute = route;
