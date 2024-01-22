const { env } = process as {
  env: {
    [key: string]: string;
  };
};

export const {
  MAIL_TRAP_PASSWORD,
  MAIL_TRAP_USER,
  MONGO_URI,
  VERIFICATION_EMAIL,
  PASSWORD_RESET_LINK,
  SIGN_IN_URL,
} = env;
// export const MONGO_URI = env.MONGO_URI;
