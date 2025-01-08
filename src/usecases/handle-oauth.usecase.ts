import { prisma } from "@/lib/prisma";
import type { OAuthProvider } from "@/types/user.type";
import { GenerateSignInDataUsecase } from "./generate-sign-in-data.usecase";

interface HandleOAuthRequest {
  provider: OAuthProvider;
  providerId: string;
  providerData: any;
  providerEmail?: string | null;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class HandleOAuthUsecase {
  private generateSignInDataUsecase: GenerateSignInDataUsecase = new GenerateSignInDataUsecase();

  async execute(request: HandleOAuthRequest) {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        email: request.providerEmail ?? undefined,
      },
      include: {
        oAuthConnections: {
          where: {
            provider: request.provider,
            providerId: request.providerId,
          },
        },
      },
    });

    // If both user and oauth already exists => case sign-in
    if (user && user.oAuthConnections.length > 0) {
      return this.generateSignInDataUsecase.execute({
        userId: user.id,
      });
    }
    // If only user exists => create oauth link to user
    if (user && user.oAuthConnections.length === 0) {
      await prisma.oAuthConnection.create({
        data: {
          provider: request.provider,
          providerId: request.providerId,
          data: request.providerData,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return this.generateSignInDataUsecase.execute({
        userId: user.id,
      });
    }
    // No user => case sign-up
    const newUser = await prisma.user.create({
      data: {
        email: request.providerEmail,
        oAuthConnections: {
          create: {
            provider: request.provider,
            providerId: request.providerId,
            data: request.providerData,
          },
        },
        mfaSettings: {
          create: {
            enabledEmail: false,
            enabledSMS: false,
            enabledTOTP: false,
          },
        },
      },
    });

    return this.generateSignInDataUsecase.execute({
      userId: newUser.id,
    });
  }
}
