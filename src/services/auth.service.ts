import { AppError } from "../errors/AppError";
import { generateToken } from "../libs/jwt";
import { prisma } from "../libs/prisma";
import { verifyPassword } from "../utils/hash";
import { getTechnicianByEmail } from "./technician.service";

export const loginTechnician = async (email: string, password: string) => {
    const user = await getTechnicianByEmail(email);
    if (!user) throw new AppError('Credenciais inválidas', 401);
    const passwordCheck = await verifyPassword(password, user.password);
    if (!passwordCheck) throw new AppError('Credenciais inválidas!', 401);
    const token = await generateToken({ id: user.id, name: user.name });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        }, token
    };
};