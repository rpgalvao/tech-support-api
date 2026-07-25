import { Router } from "express";
import * as PartController from "../controllers/part.controller";

const route = Router();

route.post('/', PartController.createPart);
route.get('/', PartController.getParts);
route.get('/:id', PartController.getPart);
route.put('/:id', PartController.updatePart);
route.delete('/:id', PartController.deletePart);

export default route;