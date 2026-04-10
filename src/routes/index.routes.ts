import { Router } from "express";
import technicianRoute from "./technician.routes";
import authRoute from "./auth.routes";
import { authMiddleware } from "../middlewares/auth.middleware";

const route = Router();

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

route.use('/login', authRoute);
route.use(authMiddleware);
route.use('/technician', technicianRoute);

export default route;