import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import config from "./Config.js";
import userModel from "../models/User.model.js";

const buildUsername = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || `google${Date.now()}`;

const createUniqueUsername = async (baseName) => {
  let candidate = baseName;
  let suffix = 1;

  while (await userModel.findOne({ username: candidate })) {
    candidate = `${baseName}${suffix}`;
    suffix += 1;
  }

  return candidate;
};
const getGoogleCallbackUrl = () => {
  if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;
  const base =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: getGoogleCallbackUrl(),
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        const avatar = profile.photos?.[0]?.value || "";
        const displayName =
          profile.displayName || email.split("@")[0] || `google-${profile.id}`;

        let user = await userModel.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (!user) {
          const usernameBase = buildUsername(
            displayName || email.split("@")[0] || profile.id,
          );
          const username = await createUniqueUsername(usernameBase);
          const password = crypto.randomBytes(32).toString("hex");
          const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

          try {
            user = await userModel.create({
              googleId: profile.id,
              username,
              email,
              avatar,
              authProvider: "google",
              password: hashedPassword,
            });
          } catch (createErr) {
            // Handle race / duplicate key: try to find existing user and continue
            if (createErr?.code === 11000) {
              user = await userModel.findOne({
                $or: [{ googleId: profile.id }, { email }],
              });
              if (!user) return done(createErr, null);
            } else {
              return done(createErr, null);
            }
          }
        } else {
          user.googleId = user.googleId || profile.id;
          user.avatar = avatar || user.avatar;
          user.authProvider = user.authProvider || "google";

          if (!user.password) {
            const password = crypto.randomBytes(32).toString("hex");
            user.password = crypto
              .createHash("sha256")
              .update(password)
              .digest("hex");
          }

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;
