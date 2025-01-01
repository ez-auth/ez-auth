import * as jwt from "jsonwebtoken";

import { config } from "@/config/config";

import type {
  AccessTokenPayload,
  GenerateAccessTokenPayload,
  VerifyAccessTokenPayload,
} from "./jwt.type";

export const generateAccessToken = ({ userId, sessionId }: GenerateAccessTokenPayload): string => {
  return jwt.sign({ sessionId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRY,
    issuer: config.ISSUER,
    subject: userId,
  });
};

export const verifyAccessToken = (token: string): VerifyAccessTokenPayload => {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload & AccessTokenPayload;

    return payload;
  } catch (error) {
    return null;
  }
};
