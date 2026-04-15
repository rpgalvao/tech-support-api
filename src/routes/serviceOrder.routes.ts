import { Router } from "express";
import * as ServiceOrderController from "../controllers/serviceOrder.controller";

const route = Router();

route.post('/', ServiceOrderController.createServiceOrder);
route.get('/', ServiceOrderController.listServiceOrders);
route.get('/:id', ServiceOrderController.listServiceOrderById);
route.put('/:id', ServiceOrderController.updateServiceOrder);
route.patch('/:id/cancel', ServiceOrderController.cancelServiceOrder);

export default route;