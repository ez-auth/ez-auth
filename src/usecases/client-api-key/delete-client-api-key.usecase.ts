import { prisma } from "@/lib/prisma";

export class DeleteClientApiKeyUseCase {
  async execute(id: string) {
    await prisma.clientApiKey.delete({
      where: { id },
    });

    return true;
  }
}

export const deleteClientApiKeyUsecase = new DeleteClientApiKeyUseCase();
