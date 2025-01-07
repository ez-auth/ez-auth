import { MFATokenType } from "@prisma/client";

import { configService } from "@/config/config.service";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { AuthUser } from "@/types/user.type";
import dayjs from "dayjs";

interface SendMFATokenRequest {
  provider: "Email" | "SMS";
  type: MFATokenType;
  token: string;
  subject?: string;
  content: string;
  user: AuthUser;
}

export class SendMFATokenUsecase {
  async execute(request: SendMFATokenRequest): Promise<void> {
    const config = configService.getConfig();

    // Check spam send MFA
    const lastToken = await prisma.mFAToken.findFirst({
      where: {
        userId: request.user.id,
        provider: request.provider,
        type: request.type,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    let resendDelay = config.MFA_RESEND_EMAIL_DELAY;
    if (request.provider === "SMS") {
      resendDelay = config.MFA_RESEND_SMS_DELAY;
    }
    if (lastToken && dayjs(lastToken.createdAt).add(resendDelay, "second").isAfter(dayjs())) {
      throw new UsecaseError(
        ApiCode.SendMFATokenTooOften,
        JSON.stringify({
          remainningSeconds: dayjs(lastToken.createdAt)
            .add(resendDelay, "second")
            .diff(dayjs(), "second"),
        }),
      );
    }

    if (request.provider === "Email") {
      // Requirements: subject and user.email
      if (!request.subject) {
        throw new Error("Subject is required for Email MFA provider");
      }

      if (!request.user.email) {
        throw new Error("User email is required");
      }

      await sendEmail({
        subject: request.subject,
        to: request.user.email as string,
        html: request.content,
      });
    } else if (request.provider === "SMS") {
      // Requirements: user.phone
      if (!request.user.phone) {
        throw new Error("User phone is required");
      }

      await sendSMS({ to: request.user.phone, body: request.content });
    }

    await prisma.mFAToken.create({
      data: {
        userId: request.user.id,
        type: request.type,
        provider: request.provider,
        token: request.token,
      },
    });
  }
}
