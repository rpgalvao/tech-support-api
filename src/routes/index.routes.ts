import { Router } from "express";
import userRoute from "./user.routes";
import { authMiddleware } from "../middlewares/auth.middleware";
import authRoute from "./auth.routes";
import customerRoute from "./customer.routes";
import equipmentRoute from "./equipment.routes";
import serviceOrderRoute from "./serviceOrder.routes";
import dashboardRoute from "./dashboard.routes";
import equipmentModelRoute from './equipmentModel.routes';
import checklistTemplateRoute from './checklistTemplate.routes';

const route = Router();

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

route.use('/login', authRoute);
route.use(authMiddleware);
route.use('/user', userRoute);
route.use('/dashboard', dashboardRoute);
route.use('/customer', customerRoute);
route.use('/equipment', equipmentRoute);
route.use('/serviceorder', serviceOrderRoute);
route.use('/equipmentmodel', equipmentModelRoute);
route.use('/checklist-templates', checklistTemplateRoute);

export default route;