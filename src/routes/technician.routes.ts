import { Router } from "express";
import * as TechnicianController from "../controllers/technician.controller";

const route = Router();

route.post('/', TechnicianController.createTechnician);

export default route;