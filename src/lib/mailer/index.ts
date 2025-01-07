import { configService } from "@/config/config.service";
import type { SendEmailParams } from "./mailer.type";
import { mailgunSendEmail } from "./mailgun.adapter";
import { smtpSendEmail } from "./smtp.adapter";

export const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
  const config = configService.getConfig();

  if (!config.MAILER_ENABLED) {
    throw new Error("Mailer is not enabled");
  }

  switch (config.MAILER_PROVIDER) {
    case "SMTP":
      return smtpSendEmail(params);
    case "Mailgun":
      return mailgunSendEmail(params);
    default:
      throw new Error("Invalid mailer provider");
  }
};
