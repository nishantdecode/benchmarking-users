const accountSid = process.env.TWILLIO_ACCOUND_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const phone = process.env.TWILLIO_PHONE_NUMBER;

const client = require("twilio")(accountSid, authToken);

module.exports.sendSms = (body, to) => {
  return client.messages
    .create({
      body: body,
      from: phone,
      to: `+91${to}`,
    })
    .then((message) => console.log("Successfully Otp Sent on " + to));
};
