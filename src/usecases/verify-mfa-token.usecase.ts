import { MFAProvider, MFATokenType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AuthUser } from "@/types/user.type";
import { verifyTotpUsecase } from ".";

interface VerifyMFATokenRequest {
  provider: MFAProvider;
  type: MFATokenType;
  token: string;
}

export class VerifyMFATokenUsecase {
  async execute(request: VerifyMFATokenRequest, user: AuthUser): Promise<boolean> {
    if (request.provider === "TOTP") {
      const isVerified = await verifyTotpUsecase.execute({
        token: request.token,
        userId: user.id,
      });

      return isVerified;
    }

    if (request.provider === "Email" || request.provider === "SMS") {
      const verification = await prisma.mFAToken.findFirst({
        where: {
          type: request.type,
          userId: user.id,
          provider: request.provider,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const isVerified =
        !!verification && !verification.confirmedAt && verification.token === request.token;

      if (!isVerified) {
        return false;
      }

      await prisma.mFAToken.update({
        where: {
          id: verification.id,
        },
        data: {
          confirmedAt: new Date(),
        },
      });

      return true;
    }

    return false;
  }
}
