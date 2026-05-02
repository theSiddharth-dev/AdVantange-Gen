import { Router } from "express";
import passport from "../Config/passport.js";
import * as authController from "../Controllers/auth.Controller.js";

const authRouter = Router();

const buildGoogleCallbackUrl = (req) => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }

  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/auth/google/callback`;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get("host")}/api/auth/google/callback`;
};

authRouter.post("/register", authController.registerUser);

authRouter.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    callbackURL: buildGoogleCallbackUrl(req),
  })(req, res, next);
});

authRouter.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", {
      session: false,
      callbackURL: buildGoogleCallbackUrl(req),
      failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/?auth=google-failed`,
    })(req, res, next);
  },
  authController.GoogleAuth,
);

authRouter.post("/login", authController.loginUser);

authRouter.get("/getMe", authController.getMe);

authRouter.get("/refresh-token", authController.Refreshtoken);

authRouter.get("/logout", authController.logoutUser);

authRouter.get("/logout-all", authController.logoutAll);

export default authRouter;
