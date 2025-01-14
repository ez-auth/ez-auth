import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as httpLogger } from "hono/logger";

import { configService } from "./config/config.service";
import { appErrorHandler, appNotFoundHandler } from "./lib/api-utils/app-error-handler";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";
import { applyRoutes, setUpApiDocs } from "./routes";

async function main() {
  logger.info("🕗 Starting server...");

  const app = new Hono();

  /**
   * Generic Middlewares
   */
  app.use(cors());
  app.use(
    httpLogger((message: string, ...rest: string[]) => {
      logger.info(message, ...rest);
    }),
  );

  /**
   * Setup API Docs
   */
  setUpApiDocs(app);
  logger.info("✅ API Docs applied");

  /**
   * Routes
   */
  applyRoutes(app);
  logger.info("✅ Routes applied");

  /**
   * Error Interceptors
   */
  app.onError(appErrorHandler);
  app.notFound(appNotFoundHandler);

  /**
   * Connect to database
   */
  await prisma.$connect();
  logger.info("✅ Database connected");

  /**
   * Sync config
   */
  await configService.syncConfig();
  const config = configService.getConfig();
  logger.info("✅ Config synced");

  /**
   * Bootstrap
   */
  Bun.serve({
    ...app,
    port: config.API_PORT,
    hostname: config.API_HOST,
  });

  logger.info(
    `🚀 Server running at ${config.API_URL || `http://${config.API_HOST}:${config.API_PORT}`}`,
  );
}

main();
