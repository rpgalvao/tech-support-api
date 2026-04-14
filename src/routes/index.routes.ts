import { Router } from "express";
import technicianRoute from "./technician.routes";
import { authMiddleware } from "../middlewares/auth.middleware";
import authRoute from "./auth.routes";
import customerRoute from "./customer.routes";
import equipmentRoute from "./equipment.routes";
import serviceOrderRoute from "./serviceOrder.routes";

const route = Router();

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

route.use('/login', authRoute);
route.use(authMiddleware);
route.use('/technician', technicianRoute);
route.use('/customer', customerRoute);
route.use('/equipment', equipmentRoute);
route.use('/serviceorder', serviceOrderRoute);

export default route;