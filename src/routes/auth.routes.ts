import { Router } from "express";
import * as AuthController from "../controllers/login.controller";
const route = Router();

route.post('/', AuthController.login);

export default route;