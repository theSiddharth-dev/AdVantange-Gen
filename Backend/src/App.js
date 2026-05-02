import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./Config/passport.js";
import authRouter from "./routes/auth.routes.js";
import AdRouter from "./routes/adRoutes.routes.js";

const App = express();

App.set("trust proxy", 1);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

App.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
App.use(express.json());
App.use(cookieParser());
App.use(passport.initialize());
App.use("/api/auth", authRouter);
App.use("/api/Ad", AdRouter);

export default App;
