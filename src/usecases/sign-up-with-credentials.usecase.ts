import { URLSearchParams } from "node:url";

import { configService } from "@/config/config.service";
import { SIGN_UP_CONFIRMATION_EMAIL_TEMPLATE_PATH } from "@/consts/html-email-template.const";
import { SIGN_UP_CONFIRMATION_SMS_TEMPLATE_PATH } from "@/consts/sms-template.const";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { CredentialsType } from "@/types/user.type";
import { generateNumericCode } from "@/utils";
import { sendVerificationUsecase } from ".";

interface SignUpWithCredentialsRequest {
  credentialsType: CredentialsType;
  identifier: string;
  password: string;
  redirectUrl?: string;
  metadata?: any;
}

export class SignUpWithCredentialsUsecase {
  async execute(request: SignUpWithCredentialsRequest): Promise<void> {
    const config = configService.getConfig();

    // Check if the user already exists
    const userExists = await prisma.user.count({
      where: {
        email: request.identifier,
      },
    });
    if (userExists > 0) {
      throw new UsecaseError(ApiCode.EmailExists);
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(request.password);
    // Create user
    await prisma.user.create({
      data: {
        email: request.credentialsType === CredentialsType.Email ? request.identifier : undefined,
        phone: request.credentialsType === CredentialsType.Phone ? request.identifier : undefined,
        metadata: request.metadata,
        password: hashedPassword,
        // Create MFA settings based on the credentials type
        mfaSettings: {
          create: {
            enabledEmail: request.credentialsType === CredentialsType.Email,
            enabledSMS: request.credentialsType === CredentialsType.Phone,
            enabledTOTP: false,
          },
        },
      },
    });

    // Create confirmation token
    const token = this.generateConfirmationToken(request.credentialsType);

    // Prepare subject, content to send verification
    const subject = "Confirm your email address";
    let content = "";
    if (request.credentialsType === CredentialsType.Email) {
      const template = await Bun.file(SIGN_UP_CONFIRMATION_EMAIL_TEMPLATE_PATH).text();
      content = template.replaceAll(
        "{{ .ConfirmationLink }}",
        `${config.API_URL}/confirm-sign-up?${new URLSearchParams({
          token,
          type: CredentialsType.Email,
          identifier: request.identifier,
          redirectUrl: request.redirectUrl || "",
        }).toString()}`,
      );
    } else if (request.credentialsType === CredentialsType.Phone) {
      const template = await Bun.file(SIGN_UP_CONFIRMATION_SMS_TEMPLATE_PATH).text();
      content = template.replaceAll("{{ .Code }}", token);
    }

    // Send verification
    await sendVerificationUsecase.execute({
      token,
      type: request.credentialsType,
      identifier: request.identifier,
      subject,
      content,
    });
  }

  private generateConfirmationToken(credentialsType: CredentialsType) {
    const config = configService.getConfig();

    switch (credentialsType) {
      case CredentialsType.Email:
        return Bun.randomUUIDv7("base64url");
      case CredentialsType.Phone:
        return generateNumericCode(config.VERIFICATION_CODE_LENGTH);
      default:
        throw new UsecaseError(ApiCode.InvalidCredentials);
    }
  }
}
