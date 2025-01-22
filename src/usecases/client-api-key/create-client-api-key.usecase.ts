import { prisma } from "@/lib/prisma";
import { generateRandomBase32String } from "@/utils";
import { ClientApiKeyType } from "@prisma/client";

export interface CreateClientApiKeyRequest {
  name: string;
  type: ClientApiKeyType;
}

export class CreateClientApiKeyUseCase {
  async execute(request: CreateClientApiKeyRequest) {
    const key = `ez_${generateRandomBase32String(32)}`;

    const clientApiKey = await prisma.clientApiKey.create({
      data: {
        name: request.name,
        type: request.type,
        key,
      },
    });

    return clientApiKey;
  }
}

export const createClientApiKeyUsecase = new CreateClientApiKeyUseCase();
