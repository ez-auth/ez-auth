import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import type { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { serveStatic } from "hono/bun";

import { config } from "@/config/config";
import { oauthGithubRoute } from "./oauth-github.route";
import { oauthGoogleRoute } from "./oauth-google.route";
import { passwordRecoveryRoute } from "./password-recovery.route";
import { rootRoute } from "./root.route";
import { sessionRoute } from "./session.route";

export const setUpApiDocs = (app: Hono) => {
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
        url: "/api/openapi",
      },
    }),
  );

  app.get("/docs", swaggerUI({ url: "/api/openapi" }));
};

export const setUpStatic = (app: Hono) => {
  app.use(
    "/static/*",
    serveStatic({
      root: "./",
      onFound(path, c) {
        console.log(path, c);
      },
      onNotFound(path, c) {
        console.log(path, c);
      },
    }),
  );
};

export const applyRoutes = (app: Hono) => {
  app.route("/", rootRoute);
  app.route("/sessions", sessionRoute);
  app.route("/password-recovery", passwordRecoveryRoute);

  if (config.GITHUB_ENABLED) {
    app.route("/oauth/github", oauthGithubRoute);
  }

  if (config.GOOGLE_ENABLED) {
    app.route("/oauth/google", oauthGoogleRoute);
  }
};
