import { config } from "@/config/config";
import type { SendSMSParams } from "./sms.type";
import { twilioSendSMS } from "./twilio.adapter";

export const sendSMS = async (params: SendSMSParams): Promise<boolean> => {
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
