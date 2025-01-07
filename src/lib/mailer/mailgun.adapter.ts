import { configService } from "@/config/config.service";
import { logger } from "@/lib/logger";
import type { SendEmailParams } from "./mailer.type";

export const mailgunSendEmail = async (params: SendEmailParams): Promise<boolean> => {
  const config = configService.getConfig();

  if (!config.MAILGUN_API_KEY || !config.MAILGUN_DOMAIN) {
    throw new Error("Mailgun is not configured");
  }

  const form = new FormData();

  form.append("from", `${config.MAILER_SENDER_NAME} <mailgun@${config.MAILGUN_DOMAIN}>`);
  form.append("to", params.to);
  form.append("subject", params.subject);
  form.append("html", params.html);
  form.append("text", params.text);

  const response = await fetch(`https://api.mailgun.net/v3/${config.MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`api:${config.MAILGUN_API_KEY}`)}` },
    body: form,
  });

  if (response.status !== 200) {
    const error = await response.json();
    logger.error(`Failed to send email: ${JSON.stringify(error)}`);
    return false;
  }

  return true;
};
