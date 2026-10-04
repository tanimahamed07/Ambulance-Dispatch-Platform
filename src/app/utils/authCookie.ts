import type { Response } from "express";
import config from "../config";

// Production e frontend r backend different domain e, tai cross-site cookie lagbe
// Development e same-origin (localhost:3000 and localhost:5001), tai sameSite: 'lax' enough
const isProduction = config.node_env === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // Production e https required for cross-site cookies
  sameSite:  // Production e cross-site, dev e same-site
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};