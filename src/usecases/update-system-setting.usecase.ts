import { prisma } from "@/lib/prisma";

interface UpdateSystemSettingRequest {
  data: any;
}

export class UpdateSystemSettingUsecase {
  async execute(request: UpdateSystemSettingRequest): Promise<void> {
    await prisma.systemSetting.update({
      where: {
        id: 1,
      },
      data: {
        ...request.data,
      },
    });
  }
}
