import { prisma } from "@/lib/prisma";
import { ClientApiKeyType } from "@prisma/client";

export interface UpdateClientApiKeyRequest {
  name?: string;
  type?: ClientApiKeyType;
}

export class UpdateClientApiKeyUseCase {
  async execute(id: string, request: UpdateClientApiKeyRequest) {
    await prisma.clientApiKey.update({
      where: { id },
      data: request,
    });
  }
}

export const updateClientApiKeyUsecase = new UpdateClientApiKeyUseCase();
