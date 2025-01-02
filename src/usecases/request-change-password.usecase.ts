import { MFAProvider } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

import { config } from "@/config/config";
import { CHANGE_PASSWORD_EMAIL_TEMPLATE_PATH } from "@/consts/html-email-template.const";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { AuthUser } from "@/types/user.type";
import { generateNumericCode } from "@/utils";

interface RequestChangePasswordRequest {
  mfaProvider?: MFAProvider;
}

export class RequestChangePasswordUsecase {
  async execute(user: AuthUser, request: RequestChangePasswordRequest): Promise<void> {
    if (config.CHANGE_PASSWORD_REQUIRES_MFA && !request.mfaProvider) {
      throw new HTTPException(400, { message: "MFA provider is required" });
    }
    if (request.mfaProvider) {
      this.validateMFARequest(user, request.mfaProvider);
    }

    if (config.CHANGE_PASSWORD_REQUIRES_MFA) {
      const token = generateNumericCode(6);

      switch (request.mfaProvider) {
        case "Email":
          await sendEmail({
            subject: "Change your password",
            to: user.email as string,
            html: (await Bun.file(CHANGE_PASSWORD_EMAIL_TEMPLATE_PATH).text()).replaceAll(
              "{{ .Code }}",
              token,
            ),
          });
          break;
        case "SMS":
          await sendSMS({
            to: user.phone as string,
            body: `Your change password code is ${token}`,
          });
          break;
        case "TOTP":
          // No need to store token
          break;
      }

      if (request.mfaProvider === "Email" || request.mfaProvider === "SMS") {
        await prisma.mFAToken.create({
          data: {
            userId: user.id,
            type: "ChangePassword",
            provider: request.mfaProvider,
            token,
          },
        });
      }
    }
  }

  private validateMFARequest(user: AuthUser, mfaProvider: MFAProvider) {
    if (!user.mfaSettings) {
      throw new HTTPException(400, { message: "User don't have MFA" });
    }
    switch (mfaProvider) {
      case "Email":
        if (!user.email || !user.mfaSettings.enabledEmail) {
          throw new HTTPException(400, { message: "Invalid MFA provider" });
        }
        break;
      case "SMS":
        if (!user.phone || !user.mfaSettings.enabledSMS) {
          throw new HTTPException(400, { message: "Invalid MFA provider" });
        }
        break;
      case "TOTP":
        if (!user.mfaSettings.enabledTOTP) {
          throw new HTTPException(400, { message: "Invalid MFA provider" });
        }
        break;
    }
  }
}
