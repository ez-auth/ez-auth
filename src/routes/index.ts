import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import type { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { serveStatic } from "hono/bun";

import { configService } from "@/config/config.service";
import { changePasswordRoute } from "./change-password.route";
import { mfaSettingsRoute } from "./mfa.route";
import { oauthGithubRoute } from "./oauth-github.route";
import { oauthGoogleRoute } from "./oauth-google.route";
import { passwordRecoveryRoute } from "./password-recovery.route";
import { rootRoute } from "./root.route";
import { sessionRoute } from "./session.route";
import { superadminRoute } from "./superadmin.route";

export const setUpApiDocs = (app: Hono) => {
  const config = configService.getConfig();

  app.get(
    "/openapi",
    openAPISpecs(app, {
      documentation: {
        info: { title: "EzAuth API", version: "1.0.0", description: "EzAuth API" },
        servers: [{ url: config.API_URL, description: "Local Server" }],
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    }),
  );

  app.get(
    "/reference",
    apiReference({
      spec: {
        url: "/openapi",
      },
    }),
  );

  app.get("/swagger", swaggerUI({ url: "/openapi" }));
};

export const applyRoutes = (app: Hono) => {
  const config = configService.getConfig();

  app.route("/", rootRoute);
  app.route("/superadmin", superadminRoute);
  app.route("/sessions", sessionRoute);
  app.route("/password-recovery", passwordRecoveryRoute);
  app.route("/change-password", changePasswordRoute);
  app.route("/mfa", mfaSettingsRoute);

  if (config.GITHUB_ENABLED) {
    app.route("/oauth/github", oauthGithubRoute);
  }

  if (config.GOOGLE_ENABLED) {
    app.route("/oauth/google", oauthGoogleRoute);
  }
};
