import {Router} from 'express'
import * as AdController from '../Controllers/Ad.controller.js';
const AdRouter = Router();

AdRouter.post("/generate",AdController.generateAd)

export default AdRouter