import type { ApiCode } from "@/lib/api-utils/api-code";

export class UsecaseError extends Error {
  public code: ApiCode;

  constructor(code: ApiCode, message?: string) {
    super(message);
    this.name = "UsecaseError";
    this.code = code;
  }
}

export const isUsecaseError = (error: Error) => {
  return error instanceof UsecaseError;
};

export const isUsecaseErrorWithCode = (error: Error, code: ApiCode) => {
  return isUsecaseError(error) && error.code === code;
};
