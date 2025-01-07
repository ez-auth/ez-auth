import { MFAProvider } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

import { configService } from "@/config/config.service";
import { CHANGE_PASSWORD_EMAIL_TEMPLATE_PATH } from "@/consts/html-email-template.const";
import { CHANGE_PASSWORD_SMS_TEMPLATE_PATH } from "@/consts/sms-template.const";
import { AuthUser } from "@/types/user.type";
import { generateNumericCode } from "@/utils";
import { sendMFATokenUsecase } from ".";

interface RequestChangePasswordRequest {
  mfaProvider?: MFAProvider;
}

export class RequestChangePasswordUsecase {
  async execute(user: AuthUser, request: RequestChangePasswordRequest): Promise<void> {
    const config = configService.getConfig();

    if (config.CHANGE_PASSWORD_REQUIRES_MFA && !request.mfaProvider) {
      throw new HTTPException(400, { message: "MFA provider is required" });
    }
    if (request.mfaProvider) {
      this.validateMFARequest(user, request.mfaProvider);
    }

    // TODO: CHANGE_PASSWORD_REQUIRES_MFA can be moved to user settings, override global config
    if (config.CHANGE_PASSWORD_REQUIRES_MFA) {
      const token = generateNumericCode(config.MFA_TOTP_DIGITS);

      const subject = "Change Password Request";
      let content = "";
      if (request.mfaProvider === "Email") {
        const template = await Bun.file(CHANGE_PASSWORD_EMAIL_TEMPLATE_PATH).text();
        content = template.replaceAll("{{ .Code }}", token);
      } else if (request.mfaProvider === "SMS") {
        const template = await Bun.file(CHANGE_PASSWORD_SMS_TEMPLATE_PATH).text();
        content = template.replaceAll("{{ .Code }}", token);
      }

      // Send MFA token if provider is Email or SMS
      if (request.mfaProvider === "Email" || request.mfaProvider === "SMS") {
        await sendMFATokenUsecase.execute({
          subject,
          content,
          provider: request.mfaProvider,
          token,
          type: "ChangePassword",
          user,
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
