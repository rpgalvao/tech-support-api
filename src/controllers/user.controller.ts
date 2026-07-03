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

export const updateUser: RequestHandler = async (req, res) => {
    const { id } = getUserByIdSchema.parse(req.params);
    const loggedUserId = req.user?.id;
    const file = req.file;

    if (loggedUserId !== id) {
        if (file) await fs.unlink(file.path);
        throw new AppError('Usuário não autorizado', 403);
    }

    const user = await UserService.getUserById(id);
    if (!user) {
        if (file) await fs.unlink(file.path);
        return res.status(404).json({ success: false, message: 'Usuário não encontrado!!' });
    }

    const data = updateUserSchema.parse(req.body);
    if (file) {
        data.avatar_url = file.filename;
    }

    const updatedUser = await UserService.updateUser(id, data);
    res.json({ success: true, data: updatedUser });
};

export const removeUser: RequestHandler = async (req, res) => {
    const { id } = getUserByIdSchema.parse(req.params);
    const message = await UserService.deactivateUser(id);
    res.json({ success: true, message });
};