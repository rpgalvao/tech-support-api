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
import supplierRoute from './supplier.routes';
import partRoute from './part.routes';
import stockMovementRoute from './stockMovement.routes';
import { adminMiddleware } from "../middlewares/admin.middleware";
import rateLimit from "express-rate-limit";

const route = Router();

// ==========================================
// 🚦 2. RATE LIMITING: Radar de Força Bruta
// ==========================================
const loginLimiter = rateLimit({
    //windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
    max: 5, // Limite de 5 tentativas por IP dentro dessa janela
    message: {
        success: false,
        message: 'Muitas tentativas de login. Por segurança, aguarde 15 minutos e tente novamente.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

route.use('/login', loginLimiter, authRoute);
route.use(authMiddleware);
route.use('/user', userRoute);
route.use('/dashboard', dashboardRoute);
route.use('/customer', customerRoute);
route.use('/equipment', equipmentRoute);
route.use('/serviceorder', serviceOrderRoute);
route.use('/equipmentmodel', equipmentModelRoute);
route.use('/checklist-templates', checklistTemplateRoute);
route.use('/suppliers', adminMiddleware, supplierRoute);
route.use('/parts', partRoute);
route.use('/stock-movements', stockMovementRoute);

export default route;