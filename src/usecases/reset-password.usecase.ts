import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { CredentialsType } from "@/types/user.type";
import { verifyUsecase } from ".";

interface ResetPasswordRequest {
  credentialsType: CredentialsType;
  identifier: string;
  token: string;
  newPassword: string;
}

export class ResetPasswordUsecase {
  async execute(request: ResetPasswordRequest): Promise<void> {
    // Verify token
    const verification = await verifyUsecase.execute({
      identifier: request.identifier,
      token: request.token,
      type:
        request.credentialsType === CredentialsType.Email
          ? "PasswordRecoveryByEmail"
          : "PasswordRecoveryByPhone",
    });
    const { user } = verification;

    // Check if the password is same
    if (user.password && (await Bun.password.verify(request.newPassword, user.password))) {
      throw new UsecaseError(ApiCode.PasswordSame);
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(request.newPassword);

    // Update password
    await prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        password: hashedPassword,
        verifications: {
          update: {
            where: {
              id: verification.id,
            },
            data: {
              confirmedAt: new Date(),
            },
          },
        },
      },
    });
  }
}
