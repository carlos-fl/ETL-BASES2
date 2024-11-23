import { Router } from "express";
import { DataFlow } from "../controllers/dataFlowController.js";

export const dataFlowRouter = Router();

dataFlowRouter.get('/dataFlow', DataFlow.redirectToBoard);
dataFlowRouter.post('/connect', DataFlow.connection);
dataFlowRouter.post('/tableNames', DataFlow.getTableNames);

