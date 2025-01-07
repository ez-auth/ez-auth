import { VerificationType } from "@prisma/client";
import dayjs from "dayjs";

import { configService } from "@/config/config.service";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { EMAIL_BASE_TYPES, PHONE_BASE_TYPES, VerificationData } from "@/types/verification.type";

interface SendVerificationRequest {
  type: VerificationType;
  identifier: string;
  token: string;
  delayResend?: number; // seconds
  subject?: string;
  content?: string;
  data?: VerificationData;
  userId?: string;
}

export class SendVerificationUsecase {
  async execute(request: SendVerificationRequest) {
    const config = configService.getConfig();

    // Check if the user already exists if not has userId to optimize number of queries
    if (!request.userId) {
      const user = await prisma.user.findUnique({
        where: {
          email: EMAIL_BASE_TYPES.includes(request.type) ? request.identifier : undefined,
          phone: PHONE_BASE_TYPES.includes(request.type) ? request.identifier : undefined,
        },
      });
      if (!user) {
        throw new UsecaseError(ApiCode.UserNotFound);
      }
      request.userId = user.id;
    }

    // Find verification record
    const latestVerification = await prisma.verification.findFirst({
      where: {
        type: request.type,
        userId: request.userId,
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // Check if user send verification too often
    if (
      latestVerification &&
      dayjs().diff(dayjs(latestVerification.sentAt), "seconds") < config.VERIFICATION_RESEND_DELAY
    ) {
      throw new UsecaseError(ApiCode.SendVerificationTooOften);
    }

    if (EMAIL_BASE_TYPES.includes(request.type)) {
      // Require subject and content
      if (!request.subject || !request.content) {
        throw new Error("Missing subject or content");
      }
      // Send verification email
      await sendEmail({
        to: request.identifier,
        subject: request.subject,
        html: request.content,
      });
    } else if (PHONE_BASE_TYPES.includes(request.type)) {
      // Require content
      if (!request.content) {
        throw new Error("Missing content");
      }

      // Send verification SMS
      await sendSMS({
        to: request.identifier,
        body: request.content,
      });
    }

    // Create new verification
    const verification = await prisma.verification.create({
      data: {
        type: request.type,
        token: request.token,
        userId: request.userId,
        data: request.data,
        confirmedAt: null,
        sentAt: new Date(),
      },
    });

    return verification;
  }
}
