import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import AdRouter from "./routes/adRoutes.routes.js";

const App = express();



App.use(
  cors({
    origin:["https://ad-vantange-gen.vercel.app/"],
    credentials: true,

  }),
);
App.use(express.json());
App.use(cookieParser());
App.use("/api/auth", authRouter);
App.use("/api/Ad", AdRouter);

export default App;
