import nodemailer from "nodemailer";
import path from "path";

import {
  MAIL_TRAP_PASSWORD,
  MAIL_TRAP_USER,
  SIGN_IN_URL,
  VERIFICATION_EMAIL,
} from "#/utils/variables";
import { generateTemplate } from "#/mail/template";

interface Profile {
  name: string;
  email: string;
  userId: string;
}

interface Options {
  email: string;
  link: string;
}
const genrateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAIL_TRAP_USER,
      pass: MAIL_TRAP_PASSWORD,
    },
  });

  return transport;
};

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = genrateMailTransporter();

  const { userId, email, name } = profile;

  const welcomeMessage = ` Hi ${name}, Welcome to BeatBuddy! There are so much things that we do for the verified user. Use the given OTP to Verify your account !`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Welcome Message !",
    html: generateTemplate({
      title: "Welcome to BeatBuddy, Your own music sharing App !",
      message: welcomeMessage,
      link: "#",
      logo: "cid:logo",
      banner: "cid:welcome",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        //cid => content id
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        //cid => content id
        cid: "welcome",
      },
    ],
    // html: `
    // <title>Email Verification</title>
    // <h1>Your Verifiaction token is ${OTPToken}</h1>
    // `,
  });
};

export const sendForgetPasswordLink = async (options: Options) => {
  const transport = genrateMailTransporter();

  const { link, email } = options;

  const message =
    "We just recieved the message that you forget your password, No problem, you can use the link below and create a brand new password";

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Forget Password Request!",
    html: generateTemplate({
      title: "Forget Password !",
      message,
      link,
      logo: "cid:logo",
      banner: "cid:forget_password",
      btnTitle: "Reset Password",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        //cid => content id
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        //cid => content id
        cid: "forget_password",
      },
    ],
    // html: `
    // <title>Email Verification</title>
    // <h1>Your Verifiaction token is ${OTPToken}</h1>
    // `,
  });
};

export const sendPasswordResetSuccessEmail = async (
  name: string,
  email: string
) => {
  const transport = genrateMailTransporter();

  const message = `Dear ${name}, We just updated your new password. You can sign in with your new password`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Password Reset Successfully!",
    html: generateTemplate({
      title: "Password Reset !",
      message,
      link: SIGN_IN_URL,
      logo: "cid:logo",
      banner: "cid:forget_password",
      btnTitle: "Log In",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        //cid => content id
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        //cid => content id
        cid: "forget_password",
      },
    ],
    // html: `
    // <title>Email Verification</title>
    // <h1>Your Verifiaction token is ${OTPToken}</h1>
    // `,
  });
};
