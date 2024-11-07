import { Router } from "express";
import { ControlFlow } from "../controllers/controlFlowController.js";

export const controlFlowRouter = Router()

controlFlowRouter.get('/', ControlFlow.redirectToHome)
controlFlowRouter.get('/home', ControlFlow.getHomeView)