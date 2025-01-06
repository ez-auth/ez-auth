export enum ApiCode {
  Success = "Success",

  InternalError = "InternalError",
  NotFound = "NotFound",
  BadRequest = "BadRequest",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",

  EmailExists = "EmailExists",
  PhoneExists = "PhoneExists",
  UserNotFound = "UserNotFound",
  InvalidCredentials = "InvalidCredentials",
  UserNotVerified = "UserNotVerified",
  InvalidConfirmationToken = "InvalidConfirmationToken",
  InvalidOTP = "InvalidOTP",
  InvalidMFA = "InvalidMFA",
  InvalidRefreshToken = "InvalidRefreshToken",
  InvalidSession = "InvalidSession",
  UserBanned = "UserBanned",
  PasswordSame = "PasswordSame",
  SendVerificationTooOften = "SendVerificationTooOften",
  SendMFATokenTooOften = "SendMFATokenTooOften",
}
