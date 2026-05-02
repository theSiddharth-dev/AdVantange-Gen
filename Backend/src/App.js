import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import AdRouter from "./routes/adRoutes.routes.js";

const App = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

App.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    
  }),
);
App.use(express.json());
App.use(cookieParser());
App.use("/api/auth", authRouter);
App.use("/api/Ad", AdRouter);

export default App;
