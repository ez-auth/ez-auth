import { config } from "@/config/config";
import { SIGN_UP_CONFIRMATION_EMAIL_TEMPLATE_PATH } from "@/consts/html-email-template.const";
import { SIGN_UP_CONFIRMATION_SMS_TEMPLATE } from "@/consts/sms-template.const";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { CredentialsType } from "@/types/user.type";
import { generateNumericCode } from "@/utils";

interface SignUpWithCredentialsRequest {
  credentialsType: CredentialsType;
  identifier: string;
  password: string;
  metadata?: any;
}

export class SignUpWithCredentialsUsecase {
  async execute(request: SignUpWithCredentialsRequest): Promise<void> {
    // Check if the user already exists
    const userExists = await prisma.user.count({
      where: {
        email: request.identifier,
      },
    });
    if (userExists > 0) {
      throw new UsecaseError(ApiCode.EmailExists);
    }

    // Create confirmation token
    const token = this.generateToken(request.credentialsType);

    if (request.credentialsType === CredentialsType.Email) {
      // Send verification email
      const htmlTemplate = await Bun.file(SIGN_UP_CONFIRMATION_EMAIL_TEMPLATE_PATH).text();
      await sendEmail({
        to: request.identifier,
        subject: "Confirm your email address",
        html: htmlTemplate.replaceAll(
          "{{ .ConfirmationLink }}",
          `${config.API_URL}/api/confirm-email-sign-up?token=${token}&email=${request.identifier}`,
        ),
      });
    } else if (request.credentialsType === CredentialsType.Phone) {
      // Send verification SMS
      await sendSMS({
        to: request.identifier,
        body: SIGN_UP_CONFIRMATION_SMS_TEMPLATE(token),
      });
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
        verifications: {
          create: {
            type: request.credentialsType,
            token,
            sentAt: new Date(),
          },
        },
        mfaSettings: {
          create: {},
        },
      },
    });
  }

  private generateToken(credentialsType: CredentialsType) {
    switch (credentialsType) {
      case CredentialsType.Email:
        return Bun.randomUUIDv7("base64url");
      case CredentialsType.Phone:
        return generateNumericCode(6);
      default:
        throw new UsecaseError(ApiCode.InvalidCredentials);
    }
  }
}
