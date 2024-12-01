import { Router } from "express";
import { Run } from "../controllers/runController.js";

export const runRouter = Router()

runRouter.post('/run', Run.runProject)