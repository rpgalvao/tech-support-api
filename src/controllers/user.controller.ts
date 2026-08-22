import { RequestHandler } from "express";
import { createUserSchema, getUserByIdSchema, updateUserSchema } from "../validators/user.validator";
import * as UserService from "../services/user.service";
import { AppError } from "../errors/AppError";
import fs from "fs/promises";

export const createUser: RequestHandler = async (req, res) => {
    const data = createUserSchema.parse(req.body);
    const user = await UserService.createUser(data);
    res.status(201).json({ success: true, data: user });
};

export const listUsers: RequestHandler = async (req, res) => {
    const users = await UserService.getUsersList();
    res.json({ success: true, data: users });
};

export const getUserById: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id as string);
    res.json({ success: true, data: user });
};

export const updateUser: RequestHandler = async (req, res, next) => {
    const { id } = getUserByIdSchema.parse(req.params);
    const loggedUserId = req.user?.id;
    const file = req.file;

    try {
        if (loggedUserId !== id) {
            throw new AppError('Usuário não autorizado', 403);
        }

        const data = updateUserSchema.parse(req.body);
        if (file) {
            data.avatar_url = file.filename;
        }
        const updatedUser = await UserService.updateUser(id, data);

        res.json({ success: true, data: updatedUser });

    } catch (error) {
        // ZELADOR: Se deu qualquer erro em qualquer parte do processo, ele limpa a pasta tmp
        if (file && file.path) {
            // O .catch() interno evita que o servidor trave caso a tentativa de deletar o arquivo falhe
            await fs.unlink(file.path).catch(() => { });
        }

        // Repassa o erro original para o errorHandler.middleware.ts fazer o trabalho dele
        next(error);
    }
};

export const removeUser: RequestHandler = async (req, res) => {
    const { id } = getUserByIdSchema.parse(req.params);
    const message = await UserService.deactivateUser(id);
    res.json({ success: true, message });
};