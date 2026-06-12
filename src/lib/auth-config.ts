export const googleAuthEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" &&
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const phoneAuthEnabled = process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED === "true";
