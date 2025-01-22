import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";

import { configService } from "@/config/config.service";
import { isSuperadmin } from "@/lib/middlewares/is-superadmin.middleware";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { changePasswordRoute } from "./change-password.route";
import { clientApiKeyRoute } from "./client-api-key.route";
import { mfaSettingsRoute } from "./mfa.route";
import { oauthGithubRoute } from "./oauth-github.route";
import { oauthGoogleRoute } from "./oauth-google.route";
import { passwordRecoveryRoute } from "./password-recovery.route";
import { rootRoute } from "./root";
import { sessionRoute } from "./session.route";
import { systemConfigRoute } from "./system-config.route";

export const setUpApiDocs = (app: Hono) => {
  const config = configService.getConfig();

  app.get(
    "/openapi",
    openAPISpecs(app, {
      documentation: {
        info: { title: "EzAuth API", version: "1.0.0", description: "EzAuth API" },
        servers: [{ url: config.API_URL }],
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    }),
  );

  // Scalar API Reference
  app.get("/reference", apiReference({ spec: { url: "/openapi" } }));

  // Swagger UI
  app.get("/swagger", swaggerUI({ url: "/openapi" }));
};

export const applyRoutes = (app: Hono) => {
  const config = configService.getConfig();

  // Client routes
  app.route("/", rootRoute);
  app.route("/sessions", sessionRoute);
  app.route("/password-recovery", passwordRecoveryRoute);
  app.route("/change-password", changePasswordRoute);
  app.route("/mfa", mfaSettingsRoute);

  // Superadmin routes
  const superadminRoute = new Hono();
  superadminRoute.use("*", jwtAuth);
  superadminRoute.use("*", isSuperadmin);
  superadminRoute.route("/system-configs", systemConfigRoute);
  superadminRoute.route("/client-api-keys", clientApiKeyRoute);

  app.route("/superadmin", superadminRoute);

  // OAuth routes
  if (config.GITHUB_ENABLED) {
    app.route("/oauth/github", oauthGithubRoute);
  }

  if (config.GOOGLE_ENABLED) {
    app.route("/oauth/google", oauthGoogleRoute);
  }
};
