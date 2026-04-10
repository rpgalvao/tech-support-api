import { RequestHandler } from "express";
import { createTechnicianSchema, getTechnicianByIdSchema, updateTechnicianSchema } from "../validators/technician.validator";
import * as TechnicianService from "../services/technician.service";
import { AppError } from "../errors/AppError";
import fs from "fs/promises";

export const createTechnician: RequestHandler = async (req, res) => {
    const data = createTechnicianSchema.parse(req.body);
    const technician = await TechnicianService.createUser(data);
    res.status(201).json({ success: true, data: technician });
};

export const listTechnician: RequestHandler = async (req, res) => {
    const technicians = await TechnicianService.getTechiniciansList();
    res.json({ success: true, data: technicians });
};

export const getTechinicianById: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const technician = await TechnicianService.getTechnicianById(id as string);
    res.json({ success: true, data: technician });
};

export const updateTechnician: RequestHandler = async (req, res) => {
    const { id } = getTechnicianByIdSchema.parse(req.params);
    const loggedTechnicianId = req.user?.id;
    const file = req.file;

    if (loggedTechnicianId !== id) {
        if (file) await fs.unlink(file.path);
        throw new AppError('Usuário não autorizado', 403);
    }
    const technician = await TechnicianService.getTechnicianById(id);
    if (!technician) {
        if (file) await fs.unlink(file.path);
        return res.status(404).json({ success: false, message: 'Técnico não encontrado!!' });
    }
    const data = updateTechnicianSchema.parse(req.body);
    if (file) {
        data.avatar_url = file.filename;
    }
    const updatedTechnician = await TechnicianService.updateTechnician(id, data);
    res.json({ success: true, data: updatedTechnician });
};

export const removeTechnician: RequestHandler = async (req, res) => {
    const { id } = getTechnicianByIdSchema.parse(req.params);
    const message = await TechnicianService.deactivateTechnician(id);
    res.json({ success: true, message });
};