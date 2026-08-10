import { AppError } from "../errors/AppError";
import { generateToken } from "../libs/jwt";
import { prisma } from "../libs/prisma";
import { verifyPassword } from "../utils/hash";
import { getUserByEmail } from "./user.service";

export const loginUser = async (email: string, password: string) => {
    const user = await getUserByEmail(email);
    if (!user) throw new AppError('Credenciais inválidas', 401);
    const passwordCheck = await verifyPassword(password, user.password);
    if (!passwordCheck) throw new AppError('Credenciais inválidas!', 401);
    const token = generateToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        }, token
    };
};