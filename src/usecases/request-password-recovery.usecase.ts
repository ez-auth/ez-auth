import { VerificationType } from "@prisma/client";

import { configService } from "@/config/config.service";
import { PASSWORD_RECOVERY_EMAIL_TEMPLATE_PATH } from "@/consts/html-email-template.const";
import { PASSWORD_RECOVERY_SMS_TEMPLATE_PATH } from "@/consts/sms-template.const";
import { CredentialsType } from "@/types/user.type";
import { generateNumericCode } from "@/utils";
import { sendVerificationUsecase } from ".";

interface RequestPasswordRecoveryRequest {
  credentialsType: CredentialsType;
  identifier: string;
  redirectUrl?: string;
}

export class RequestPasswordRecoveryUsecase {
  async execute(request: RequestPasswordRecoveryRequest): Promise<void> {
    const config = configService.getConfig();

    // Create verification token
    const token = generateNumericCode(config.VERIFICATION_CODE_LENGTH);

    // Prepare subject, content
    const subject = "Password Recovery";
    let content = "";
    if (request.credentialsType === CredentialsType.Email) {
      const template = await Bun.file(PASSWORD_RECOVERY_EMAIL_TEMPLATE_PATH).text();
      content = template.replaceAll("{{ .Code }}", token);
    } else if (request.credentialsType === CredentialsType.Phone) {
      const template = await Bun.file(PASSWORD_RECOVERY_SMS_TEMPLATE_PATH).text();
      content = template.replaceAll("{{ .Code }}", token);
    }

    let type: VerificationType = "PasswordRecoveryByEmail";
    if (request.credentialsType === CredentialsType.Phone) {
      type = "PasswordRecoveryByPhone";
    }

    // Send verification
    await sendVerificationUsecase.execute({
      subject,
      content,
      type,
      identifier: request.identifier,
      token,
    });
  }
}
