import { Router } from "express";
import * as ServiceOrderController from "../controllers/serviceOrder.controller";
import multer from "multer";
import { uploadConfig } from "../libs/multer";

const route = Router();
const upload = multer(uploadConfig);

route.post('/', ServiceOrderController.createServiceOrder);
route.get('/', ServiceOrderController.listServiceOrders);
route.get('/:id', ServiceOrderController.listServiceOrderById);
route.put('/:id', ServiceOrderController.updateServiceOrder);

// Nossas rotas de ciclo de vida isoladas
route.patch('/:id/cancel', ServiceOrderController.cancelServiceOrder);
route.patch('/:id/reopen', ServiceOrderController.reopenServiceOrder);
route.patch('/:id/checklist', ServiceOrderController.updateChecklist);
// Adicionando peça na O.S. e baixando o estoque
route.post('/:id/parts', ServiceOrderController.addPart);

// Assinatura da O.S.
route.patch('/:id/signature', ServiceOrderController.saveClientSignature);

export default route;