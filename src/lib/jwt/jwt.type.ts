import type { JwtPayload } from "jsonwebtoken";

export interface GenerateAccessTokenPayload {
  userId: string;
  sessionId: string;
}

export interface AccessTokenPayload {
  sessionId: string;
}

export type VerifyAccessTokenPayload = (JwtPayload & AccessTokenPayload) | null;
