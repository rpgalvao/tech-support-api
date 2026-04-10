import { RequestHandler } from "express";
import { loginTechnicianSchema } from "../validators/login.validator";
import * as AuthService from "../services/auth.service";
import { AppError } from "../errors/AppError";

export const login: RequestHandler = async (req, res) => {
    const data = loginTechnicianSchema.parse(req.body);
    const { email, password } = data;
    const user = await AuthService.loginTechnician(email, password);
    if (!user) throw new AppError('Não autorizado', 401);
    res.json({ success: true, data: user });
};