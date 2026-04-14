import { RequestHandler } from "express";
import * as ServiceOrder from "../services/serviceOrder.service";
import { openServiceOrderSchema, serviceOrderIdSchema } from "../validators/serviceOrder.validator";
import { AppError } from "../errors/AppError";

export const createServiceOrder: RequestHandler = async (req, res) => {
    const technicianId = req.user?.id;
    if (!technicianId) throw new AppError('Usuário não autenticado', 401);
    const data = openServiceOrderSchema.parse(req.body);
    const newData = {
        ...data,
        technicianId
    };
    const serviceOrder = await ServiceOrder.createServiceOrder(newData);
    res.status(201).json({ success: true, data: serviceOrder });
};

export const listServiceOrders: RequestHandler = async (req, res) => {
    const serviceOrders = await ServiceOrder.listAllServiceOrders();
    res.json({ success: true, data: serviceOrders });
};

export const listServiceOrderById: RequestHandler = async (req, res) => {
    const { id } = serviceOrderIdSchema.parse(req.params);
    const serviceOrder = await ServiceOrder.getServiceOrderById(id);
    res.json({ success: true, data: serviceOrder });
};

export const updateServiceOrder: RequestHandler = async (req, res) => {

};

export const deleteServiceOrder: RequestHandler = async (req, res) => {

};