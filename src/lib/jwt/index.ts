import * as jwt from "jsonwebtoken";

import { configService } from "@/config/config.service";
import type {
  AccessTokenPayload,
  GenerateAccessTokenPayload,
  VerifyAccessTokenPayload,
} from "./jwt.type";

export const generateAccessToken = ({ userId, sessionId }: GenerateAccessTokenPayload): string => {
  const config = configService.getConfig();

  return jwt.sign({ sessionId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRY,
    issuer: config.ISSUER,
    subject: userId,
  });
};

export const verifyAccessToken = (token: string): VerifyAccessTokenPayload => {
  try {
    const config = configService.getConfig();
    const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload & AccessTokenPayload;

    return payload;
  } catch (error) {
    return null;
  }
};
