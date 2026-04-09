import { RequestHandler } from "express";
import { createTechnicianSchema } from "../validators/technician.validator";
import * as TechnicianService from "../services/technician.service";

export const createTechnician: RequestHandler = async (req, res) => {
    const data = createTechnicianSchema.parse(req.body);
    const technician = await TechnicianService.createUser(data);
    res.status(201).json({ success: true, data: technician });
};