import { Router } from "express";
import technicianRoute from "./technician.routes";
import { authMiddleware } from "../middlewares/auth.middleware";
import authRoute from "./auth.routes";
import customerRoute from "./customer.routes";

const route = Router();

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

route.use('/login', authRoute);
route.use(authMiddleware);
route.use('/technician', technicianRoute);
route.use('/customer', customerRoute);

export default route;