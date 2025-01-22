import { prisma } from "@/lib/prisma";

export class GetClientApiKeyUseCase {
  async execute(id: string) {
    const clientApiKey = await prisma.clientApiKey.findUnique({
      where: { id },
    });

    return clientApiKey;
  }
}

export const getClientApiKeyUsecase = new GetClientApiKeyUseCase();
