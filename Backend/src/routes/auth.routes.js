import {Router} from 'express'
import * as authController from '../Controllers/authController.js';

const authRouter = Router()

authRouter.post("/register", authController.registerUser)

authRouter.post("/login",authController.loginUser)

authRouter.get("/getMe", authController.getMe)

authRouter.get("/refresh-token",authController.Refreshtoken)

authRouter.get("/logout",authController.logoutUser)

authRouter.get("/logout-all",authController.logoutAll)

export default authRouter;