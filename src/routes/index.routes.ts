import { Router } from "express";
import technicianRoute from "./technician.routes";
import authRoute from "./auth.routes";

const route = Router();

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

route.use('/login', authRoute);
route.use('/technician', technicianRoute);

export default route;