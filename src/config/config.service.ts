import { prisma } from "@/lib/prisma";
import { Config, initialConfig } from ".";

export class ConfigService {
  private static instance: ConfigService;
  private config: Config = initialConfig;
  public static immutableKeys: Array<keyof Config> = [
    "API_HOST",
    "API_URL",
    "API_PORT",
    "DATABASE_URL",
  ];

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getConfig(): Config {
    return this.config;
  }

  static getOmittedInitialConfig() {
    const config = initialConfig;

    for (const key of ConfigService.immutableKeys) {
      delete config[key];
    }

    return config;
  }

  public async syncConfig(data?: Partial<Config>) {
    // Delete immutable config keys
    for (const key of ConfigService.immutableKeys) {
      delete data?.[key];
    }

    if (!data) {
      const existingConfig = await prisma.systemConfig.findUnique({
        where: {
          id: 1,
        },
      });
      if (!existingConfig?.data) {
        return;
      }

      this.config = {
        ...this.config,
        ...(existingConfig?.data as Partial<Config>),
      };
      return;
    }

    this.config = {
      ...this.config,
      ...(data as Partial<Config>),
    };
  }
}

export const configService = ConfigService.getInstance();
