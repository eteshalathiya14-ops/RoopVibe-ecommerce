const usesTwilio = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );

const usesFast2Sms = () => Boolean(process.env.FAST2SMS_API_KEY);

exports.canSendSms = () => usesTwilio() || usesFast2Sms();

exports.normalizeIndianPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return null;
};

async function sendViaTwilio(phone10, otp) {
  const twilio = require("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your RoopVibe login OTP is ${otp}. Valid for 10 minutes. Do not share.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone10}`,
  });
}

async function sendViaFast2Sms(phone10, otp) {
  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "otp",
      variables_values: otp,
      numbers: phone10,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.return === false) {
    throw new Error(data.message || "Fast2SMS failed to send OTP");
  }
}

exports.sendPhoneOtpSms = async (phone10, otp) => {
  if (!exports.canSendSms()) {
    throw new Error(
      "SMS is not configured. Add Twilio or FAST2SMS_API_KEY in backend .env"
    );
  }

  if (usesTwilio()) {
    await sendViaTwilio(phone10, otp);
    return { realDelivery: true, provider: "twilio" };
  }

  await sendViaFast2Sms(phone10, otp);
  return { realDelivery: true, provider: "fast2sms" };
};
