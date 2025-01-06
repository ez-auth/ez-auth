import dayjs from "dayjs";

import { config } from "@/config/config";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { EMAIL_BASE_TYPES, PHONE_BASE_TYPES, VerificationData } from "@/types/verification.type";
import { VerificationType } from "@prisma/client";

interface VerifyRequest {
  token: string;
  type: VerificationType;
  identifier: string;
  expiry?: number; // in seconds
  data?: VerificationData;
}

export class VerifyUsecase {
  async execute(request: VerifyRequest) {
    // Get user with email/phone
    const user = await prisma.user.findUnique({
      where: {
        email: EMAIL_BASE_TYPES.includes(request.type) ? request.identifier : undefined,
        phone: PHONE_BASE_TYPES.includes(request.type) ? request.identifier : undefined,
      },
    });
    if (!user) {
      throw new UsecaseError(ApiCode.UserNotFound);
    }

    // Check if the token is valid
    const verification = await prisma.verification.findFirst({
      where: {
        token: request.token,
        type: request.type,
        userId: user.id,
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // Check if the token is valid
    if (
      !verification ||
      verification.confirmedAt ||
      dayjs(verification.sentAt)
        .add(request.expiry ?? config.VERIFICATION_EXPIRY, "second")
        .isBefore(dayjs())
    ) {
      throw new UsecaseError(ApiCode.InvalidConfirmationToken);
    }

    // Confirm the user
    return prisma.verification.update({
      where: {
        id: verification.id,
      },
      data: {
        confirmedAt: new Date(),
        user: {
          update: {
            isVerifiedEmail: request.type === "Email" ? true : undefined,
            isVerifiedPhone: request.type === "Phone" ? true : undefined,
          },
        },
      },
      include: {
        user: true,
      },
    });
  }
}
