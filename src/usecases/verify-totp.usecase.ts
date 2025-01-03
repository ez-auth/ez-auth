import { prisma } from "@/lib/prisma";
import { HTTPException } from "hono/http-exception";
import * as OTPAuth from "otpauth";

interface VerifyTotpRequest {
  userId: string;
  token: string;
}

export class VerifyTotpUsecase {
  async execute(request: VerifyTotpRequest): Promise<boolean> {
    const mfaSettings = await prisma.mFASettings.findUnique({
      where: {
        userId: request.userId,
      },
    });
    if (!mfaSettings || !mfaSettings.enabledTOTP || !mfaSettings.totpSecret) {
      throw new HTTPException(400, { message: "Invalid MFA settings" });
    }

    const totp = new OTPAuth.TOTP({
      digits: 6,
      secret: mfaSettings.totpSecret,
      period: 30,
    }).generate();

    return totp === request.token;
  }
}
