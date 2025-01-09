import { configService } from "@/config/config.service";
import { prisma } from "@/lib/prisma";

interface UpdateSystemConfigRequest {
  data: any;
}

export class UpdateSystemConfigUsecase {
  async execute(request: UpdateSystemConfigRequest): Promise<void> {
    const systemConfig = await prisma.systemConfig.findUnique({
      where: {
        id: 1,
      },
    });
    if (!systemConfig) {
      throw new Error("System config not found");
    }

    const newData = {
      ...(systemConfig.data as any),
      ...request.data,
    };

    // Update system config
    await prisma.systemConfig.update({
      where: {
        id: 1,
      },
      data: {
        data: newData,
      },
    });

    // Sync config
    await configService.syncConfig(newData);

    // Audit log
    await prisma.auditLog.create({
      data: {
        type: "update-system-config",
        data: request.data,
      },
    });
  }
}
