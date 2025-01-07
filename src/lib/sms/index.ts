import { configService } from "@/config/config.service";
import type { SendSMSParams } from "./sms.type";
import { twilioSendSMS } from "./twilio.adapter";

export const sendSMS = async (params: SendSMSParams): Promise<boolean> => {
  const config = configService.getConfig();

  if (!config.SMS_ENABLED) {
    throw new Error("SMS is not enabled");
  }

  switch (config.SMS_PROVIDER) {
    case "Twilio":
      return twilioSendSMS(params);
    default:
      throw new Error("Invalid SMS provider");
  }
};
