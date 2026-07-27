import { RequestHandler } from "express";
import * as ServiceOrder from "../services/serviceOrder.service";
import { addPartToOsSchema, cancelServiceOrderSchema, openServiceOrderSchema, serviceOrderIdSchema, updateChecklistSchema, updateServiceOrderSchema } from "../validators/serviceOrder.validator";
import { AppError } from "../errors/AppError";

export const createServiceOrder: RequestHandler = async (req, res) => {
    if (!req.user) throw new AppError('Usuário não autenticado', 401);
    const loggedId = req.user.id;
    const data = openServiceOrderSchema.parse(req.body);
    const serviceOrder = await ServiceOrder.createServiceOrder(data, loggedId);
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
    if (!req.user) throw new AppError('Usuário não autenticado', 401);
    const loggedId = req.user.id;
    const { id } = serviceOrderIdSchema.parse(req.params);
    const data = updateServiceOrderSchema.parse(req.body);
    const updatedOS = await ServiceOrder.updateServiceOrder(id, data, loggedId);
    res.json({ success: true, data: updatedOS });
};

export const cancelServiceOrder: RequestHandler = async (req, res) => {
    if (!req.user) throw new AppError('Usuário não autenticado', 401);
    const loggedId = req.user.id;
    const { id } = serviceOrderIdSchema.parse(req.params);
    const { reason } = cancelServiceOrderSchema.parse(req.body);
    const message = await ServiceOrder.cancelServiceOrder(id, reason, loggedId);
    res.json({ success: true, data: message });
};

export const reopenServiceOrder: RequestHandler = async (req, res) => {
    if (!req.user) throw new AppError('Usuário não autenticado', 401);

    const loggedId = req.user.id;
    const { id } = serviceOrderIdSchema.parse(req.params); // Reaproveitamos a validação de ID!

    const message = await ServiceOrder.reopenServiceOrder(id, loggedId);
    res.json({ success: true, data: message });
};

export const updateChecklist: RequestHandler = async (req, res) => {
    if (!req.user) throw new AppError('Usuário não autenticado', 401);

    // Reaproveitamos o validador de ID da O.S.
    const { id } = serviceOrderIdSchema.parse(req.params);
    // Validamos o array de respostas
    const data = updateChecklistSchema.parse(req.body);

    const result = await ServiceOrder.updateServiceOrderChecklist(id, data);
    res.json({ success: true, data: result });
};

export const addPart: RequestHandler = async (req, res) => {
    if (!req.user) throw new AppError('Usuário não autenticado', 401);

    const loggedId = req.user.id;
    const { id: osId } = serviceOrderIdSchema.parse(req.params); // Reaproveitando sua validação!
    const { partId, quantity } = addPartToOsSchema.parse(req.body);

    const result = await ServiceOrder.addPartToServiceOrder(osId, partId, quantity, loggedId);

    res.status(201).json({ success: true, data: result });
};