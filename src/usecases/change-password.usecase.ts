import { MFAProvider } from "@prisma/client";

import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { AuthUser } from "@/types/user.type";

interface ChangePasswordRequest {
  mfaProvider?: MFAProvider;
  token?: string;
  newPassword: string;
}

export class ChangePasswordUsecase {
  async execute(user: AuthUser, request: ChangePasswordRequest): Promise<void> {
    // Get user from database to check same password
    const currentPassword = (
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          password: true,
        },
      })
    )?.password;

    if (currentPassword && (await Bun.password.verify(request.newPassword, currentPassword))) {
      throw new UsecaseError(ApiCode.PasswordSame);
    }

    // Update password
    const hashedPassword = await Bun.password.hash(request.newPassword);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // TODO: Sign out all sessions based on user's settings/global config
  }
}
