import { Router } from "express";
import * as PartController from "../controllers/part.controller";

const route = Router();

route.post('/', PartController.createPart);
route.get('/', PartController.getParts);
// ⚠️ Rota específica DEVE vir antes das rotas com parâmetros dinâmicos (/:id)
route.get('/dashboard/low-stock', PartController.getLowStockDashboard);
route.get('/:id', PartController.getPart);
route.put('/:id', PartController.updatePart);
route.delete('/:id', PartController.deletePart);

export default route;