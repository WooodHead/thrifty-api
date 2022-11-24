import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  domain: "localhost", // Remember to set this value to the Front End domain for cookies to be sent
  path: "/v1/auth/refresh_token",
  httpOnly: true,
  maxAge: 604800000,
  signed: true,
  sameSite: "strict",
  secure: true,
};
