import express from "express"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"

const App = express()

App.use(express.json());
App.use(cookieParser());
App.use("/api/auth",authRouter)

export default App