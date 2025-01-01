import dayjs from "dayjs";

import { config } from "@/config/config";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";

interface ConfirmEmailRequest {
  token: string;
  email: string;
}

export class ConfirmEmailUsecase {
  async execute(request: ConfirmEmailRequest) {
    // Check if the token is valid
    const verification = await prisma.verification.findFirst({
      where: {
        token: request.token,
        type: "Email",
        user: {
          email: request.email,
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // Check if the token is valid
    if (
      !verification ||
      !!verification.confirmedAt ||
      dayjs(verification.sentAt).add(config.VERIFICATION_EXPIRY, "second").isBefore(dayjs())
    ) {
      throw new UsecaseError(ApiCode.InvalidConfirmationToken);
    }

    // Confirm the user
    await prisma.verification.update({
      where: {
        id: verification.id,
      },
      data: {
        confirmedAt: new Date(),
      },
    });
  }
}
