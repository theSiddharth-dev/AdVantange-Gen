import express from "express"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import AdRouter from "./routes/adRoutes.routes.js"

const App = express()

App.use(express.json());
App.use(cookieParser());
App.use("/api/auth",authRouter)
App.use("/api/Ad",AdRouter)

export default App