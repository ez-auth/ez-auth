import { prisma } from "@/lib/prisma";

export class GetClientApiKeysUseCase {
  async execute() {
    const clientApiKeys = await prisma.clientApiKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    return clientApiKeys;
  }
}

export const getClientApiKeysUsecase = new GetClientApiKeysUseCase();
