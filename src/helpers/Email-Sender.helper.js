// const AWS = require('aws-sdk');
// const nodemailer = require('nodemailer')

const nodemailer = require("nodemailer");
const prodApiKey = process.env.BREVO_API_KEY;
const sendinBlueTransport = require("nodemailer-sendinblue-transport");
const transporter = nodemailer.createTransport(
  new sendinBlueTransport({
    apiKey: prodApiKey,
  })
);

async function sendMail(receiver, subject, msg) {
  try {
    const mailOptions = {
      from: "tech@edzer.org",
      to: receiver,
      subject: subject,
      text: msg,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email: " + error);
  }
}

module.exports = { sendMail };
