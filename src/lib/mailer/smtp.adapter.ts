import * as nodemailer from "nodemailer";

import { configService } from "@/config/config.service";
import { logger } from "@/lib/logger";
import type { SendEmailParams } from "./mailer.type";

export const smtpSendEmail = async (params: SendEmailParams): Promise<boolean> => {
  const config = configService.getConfig();

  if (!config.SMTP_HOST || !config.SMTP_PORT || !config.SMTP_USER || !config.SMTP_PASS) {
    throw new Error("SMTP is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    from: `${config.MAILER_SENDER_NAME} <${config.SMTP_SENDER_EMAIL}>`,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail(params);
    return true;
  } catch (error) {
    logger.error(`Failed to send email:\n${error}`);
    return false;
  }
};
