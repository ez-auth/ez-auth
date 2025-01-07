import { prisma } from "@/lib/prisma";
import { Config, initialConfig } from ".";

export class ConfigService {
  private static instance: ConfigService;
  private config: Config = initialConfig;

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

  public async syncSettings() {
    const settings = await prisma.systemSetting.findUnique({
      where: {
        id: 1,
      },
    });

    if (!settings) {
      return;
    }

    this.config = {
      ...this.config,
      ...(settings.data as Partial<Config>),
    };
  }
}

export const configService = ConfigService.getInstance();
