import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import { AuthUser } from "@/types/user.type";
import { MFASettings, UpdateInput } from "@prisma/client";

export interface UpdateMFASettingsRequest {
  enabledTOTP?: boolean;
  enabledEmail?: boolean;
  enabledSMS?: boolean;
}

export interface UpdateMFASettingsResponse {
  totpSecret?: string;
  backupKey?: string;
}

export class UpdateMFASettingsUsecase {
  async execute(
    user: AuthUser,
    request: UpdateMFASettingsRequest,
  ): Promise<UpdateMFASettingsResponse> {
    const existingSettings = await prisma.mFASettings.findUnique({
      select: {
        enabledTOTP: true,
        hashedBackupKey: true,
      },
      where: {
        userId: user.id,
      },
    });

    // Validate Email settings
    if (request.enabledEmail && !user.isVerifiedEmail) {
      throw new HTTPException(400, { message: "Email must be verified to enable Email MFA" });
    }

    // Validate SMS settings
    if (request.enabledSMS && !user.isVerifiedPhone) {
      throw new HTTPException(400, { message: "Phone number must be verified to enable SMS MFA" });
    }

    const dataToUpsert: Pick<
      UpdateInput<MFASettings>,
      "enabledEmail" | "enabledSMS" | "enabledTOTP" | "totpSecret" | "hashedBackupKey"
    > = {
      enabledTOTP: request.enabledTOTP ?? undefined,
      enabledEmail: request.enabledEmail ?? undefined,
      enabledSMS: request.enabledSMS ?? undefined,
    };
    let backupKey: string | undefined;
    let totpSecret: string | undefined;

    // Case enable TOTP (from disabled)
    if (request.enabledTOTP && !existingSettings?.enabledTOTP) {
      // Generate secret key
      totpSecret = this.generateSecretKey();
      dataToUpsert.totpSecret = totpSecret;

      // Generate backup key if not exist
      if (!existingSettings?.hashedBackupKey) {
        backupKey = this.generateBackupKey();
        dataToUpsert.hashedBackupKey = await Bun.password.hash(backupKey);
      }
    }

    await prisma.mFASettings.upsert({
      create: {
        userId: user.id,
        ...dataToUpsert,
      },
      where: {
        userId: user.id,
      },
      update: dataToUpsert,
    });

    return {
      totpSecret,
      backupKey,
    };
  }

  private generateSecretKey(): string {
    return Bun.randomUUIDv7("base64url");
  }

  private generateBackupKey(): string {
    // Concat 2 random string
    return `${Bun.randomUUIDv7("base64url")}-${Bun.randomUUIDv7("base64url")}`;
  }
}
