import dayjs from "dayjs";

import { config } from "@/config/config";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";

interface ConfirmPhoneRequest {
  token: string;
  phone: string;
}

export class ConfirmPhoneUsecase {
  async execute(request: ConfirmPhoneRequest) {
    // Check if the token is valid
    const verification = await prisma.verification.findFirst({
      where: {
        token: request.token,
        type: "Phone",
        user: {
          phone: request.phone,
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
