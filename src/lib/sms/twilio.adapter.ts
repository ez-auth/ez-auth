import { configService } from "@/config/config.service";
import type { SendSMSParams } from "./sms.type";

export const twilioSendSMS = async (params: SendSMSParams) => {
  const config = configService.getConfig();

  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio is not configured");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`)}`,
      },
      body: `To=${params.to}&From=${config.TWILIO_PHONE_NUMBER}&Body=${params.body}`,
    },
  );

  return response.status === 201;
};
