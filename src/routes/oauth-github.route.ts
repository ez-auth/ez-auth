import { Hono } from "hono";
import { getConnInfo } from "hono/bun";
import { getCookie } from "hono/cookie";

import { configService } from "@/config/config.service";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { githubAuthMiddleware } from "@/lib/oauth/github/github-auth.middleware";
import type { GitHubUser } from "@/lib/oauth/github/github-auth.type";
import { OAuthProvider } from "@/types/user.type";
import { handleOAuthUsecase } from "@/usecases";

const route = new Hono();
const config = configService.getConfig();

route.use(
  "/*",
  githubAuthMiddleware({
    client_id: config.GITHUB_CLIENT_ID,
    client_secret: config.GITHUB_CLIENT_SECRET,
    scope: ["read:user", "user:email"],
    oauthApp: true,
  }),
);

route.get("/callback", async (c) => {
  const user = c.get("user-github") as (Partial<GitHubUser> & { id: number }) | undefined;
  const state = getCookie(c, "state");

  const { clientRedirectUrl } = JSON.parse(state ?? "{}");

  if (!user) {
    throw new UsecaseError(ApiCode.InvalidCredentials);
  }

  const response = await handleOAuthUsecase.execute({
    provider: OAuthProvider.Github,
    providerId: user.id.toString(),
    providerEmail: user.email,
    providerData: { user, granted_scopes: c.get("granted-scopes") },
    ipAddress: getConnInfo(c).remote.address,
    userAgent: c.req.header("User-Agent"),
  });

  return c.redirect(
    `${clientRedirectUrl ?? config.CLIENT_REDIRECT_URL}?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}&sessionId=${response.sessionId}`,
  );
});

export const oauthGithubRoute = route;
