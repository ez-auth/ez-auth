import dayjs from "dayjs";

import { config } from "@/config/config";
import { PASSWORD_RECOVERY_EMAIL_TEMPLATE_PATH } from "@/consts/html-email-template.const";
import { PASSWORD_RECOVERY_SMS_TEMPLATE } from "@/consts/sms-template.const";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { CredentialsType } from "@/types/user.type";
import { generateNumericCode } from "@/utils";

interface RequestPasswordRecoveryRequest {
  credentialsType: CredentialsType;
  identifier: string;
  redirectUrl?: string;
}

export class RequestPasswordRecoveryUsecase {
  async execute(request: RequestPasswordRecoveryRequest): Promise<void> {
    // Find user by email or phone
    const user = await prisma.user.findUnique({
      where: {
        email: request.credentialsType === CredentialsType.Email ? request.identifier : undefined,
        phone: request.credentialsType === CredentialsType.Phone ? request.identifier : undefined,
      },
      include: {
        verifications: {
          where: {
            type: "PasswordRecovery",
            confirmedAt: null,
          },
          orderBy: {
            sentAt: "desc",
          },
        },
      },
    });

    // Check if user exists
    if (!user) {
      throw new UsecaseError(ApiCode.UserNotFound);
    }

    // Check if user send password recovery too often
    const lastVerification = user.verifications?.[0] || null;
    if (lastVerification) {
      if (
        dayjs(lastVerification.sentAt)
          .add(config.VERIFICATION_RESEND_DELAY, "second")
          .isAfter(dayjs())
      ) {
        throw new UsecaseError(
          ApiCode.PasswordRecoveryRateLimited,
          JSON.stringify({
            remaining: dayjs(lastVerification.sentAt)
              .add(config.VERIFICATION_RESEND_DELAY, "second")
              .diff(dayjs(), "second"),
          }),
        );
      }
    }

    // Create verification token
    const token = this.generateToken();

    // Send email
    if (request.credentialsType === CredentialsType.Email) {
      // Read email template
      const template = await Bun.file(PASSWORD_RECOVERY_EMAIL_TEMPLATE_PATH).text();

      await sendEmail({
        to: request.identifier,
        subject: "Password Recovery",
        html: template.replaceAll("{{ .Code }}", token),
      });
    } else if (request.credentialsType === CredentialsType.Phone) {
      // Send SMS
      await sendSMS({
        to: request.identifier,
        body: PASSWORD_RECOVERY_SMS_TEMPLATE(token),
      });
    }

    // Create verification record
    await prisma.verification.create({
      data: {
        userId: user.id,
        type: "PasswordRecovery",
        token,
        sentAt: new Date(),
      },
    });
  }

  private generateToken() {
    return generateNumericCode(6);
  }
}
