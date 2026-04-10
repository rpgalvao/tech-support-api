import { Router } from "express";
import * as TechnicianController from "../controllers/technician.controller";
import { uploadConfig } from "../libs/multer";
import multer from "multer";

const route = Router();
const upload = multer(uploadConfig);

route.post('/', TechnicianController.createTechnician);
route.get('/', TechnicianController.listTechnician);
route.get('/:id', TechnicianController.getTechinicianById);
route.patch('/:id', upload.single('avatar'), TechnicianController.updateTechnician);
route.delete('/:id', TechnicianController.removeTechnician);

export default route;