import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { StorageProvider } from "../providers/StorageProvider";
import { hashPassword } from "../utils/hash";
import { setFullURL } from "../utils/setFullUrl";

export const createUser = async (data: Prisma.UserCreateInput) => {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) throw new AppError('E-mail informado já existe no sistema', 400);

    const hashedPassword = await hashPassword(data.password);

    const newUser = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            role: data.role // Inserindo o nível de acesso no banco
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            created_at: true
        }
    });

    return newUser;
};

export const getUsersList = async () => {
    const usersList = await prisma.user.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
        }
    });
    return usersList;
};

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user;
};

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url ? setFullURL(`/uploads/avatars/${user.avatar_url}`) : null,
        created_at: user.created_at
    };
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado!', 404);

    const updateData = { ...data };
    const storage = new StorageProvider();

    if (updateData.avatar_url && typeof updateData.avatar_url === 'string') {
        await storage.saveFile(updateData.avatar_url, 'avatars', 200);
        if (user.avatar_url) {
            await storage.deleteFile(user.avatar_url, 'avatars');
        }
    }

    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await getUserByEmail(updateData.email as string);
        if (emailExists) {
            throw new AppError("E-mail informado já está em uso", 400);
        }
    }

    if (updateData.password) {
        updateData.password = await hashPassword(updateData.password as string);
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar_url: true,
            created_at: true,
            phone: true
        }
    });

    if (!updatedUser) throw new AppError('Erro ao atualizar o usuário!', 500);

    if (updatedUser.avatar_url) {
        updatedUser.avatar_url = setFullURL(`/uploads/avatars/${updatedUser.avatar_url}`);
    }

    return updatedUser;
};

export const deactivateUser = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    await prisma.user.update({
        where: { id },
        data: { active: false }
    });

    return 'Usuário desativado com sucesso';
};