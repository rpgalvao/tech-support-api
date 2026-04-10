import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { StorageProvider } from "../providers/StorageProvider";
import { hashPassword } from "../utils/hash";
import { setFullURL } from "../utils/setFullUrl";


export const createUser = async (data: Prisma.TechnicianCreateInput) => {
    const emailExists = await prisma.technician.findUnique({ where: { email: data.email } });
    if (emailExists) throw new AppError('E-mail informado já existe no sistema', 400);

    const hashedPassword = await hashPassword(data.password);

    const newTechnician = await prisma.technician.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            phone: data.phone
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            created_at: true
        }
    });

    return newTechnician;
};

export const getTechiniciansList = async () => {
    const techList = await prisma.technician.findMany({
        where: {
            active: true
        },
        orderBy: { name: 'asc' }
    });
    return techList;
};

export const getTechnicianByEmail = async (email: string) => {
    const user = await prisma.technician.findUnique({ where: { email } });
    if (!user) return null;
    return user;
};

export const getTechnicianById = async (id: string) => {
    const user = await prisma.technician.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url ? setFullURL(`/uploads/avatars/${user.avatar_url}`) : null,
        created_at: user.created_at
    };
};

export const updateTechnician = async (id: string, data: Prisma.TechnicianUpdateInput) => {
    const technician = await prisma.technician.findUnique({ where: { id } });
    if (!technician) throw new AppError('Técnico não encontrado!', 404);
    const updateData = { ...data };
    const storage = new StorageProvider();

    if (updateData.avatar_url && typeof updateData.avatar_url === 'string') {
        await storage.saveFile(updateData.avatar_url, 'avatars', 200);
        if (technician.avatar_url) {
            await storage.deleteFile(technician.avatar_url, 'avatars');
        }
    }

    if (updateData.email && updateData.email !== technician.email) {
        const emailExists = await getTechnicianByEmail(updateData.email as string);
        if (emailExists) {
            throw new AppError("E-mail informado já está em uso", 400);
        }
    }

    if (updateData.password) {
        updateData.password = await hashPassword(updateData.password as string);
    }

    const updatedTechnician = await prisma.technician.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            created_at: true,
            phone: true
        }
    });
    if (!updatedTechnician) throw new AppError('Erro ao atualizar o usuário!', 500);

    if (updatedTechnician.avatar_url) {
        updatedTechnician.avatar_url = setFullURL(`files/avatars/${updatedTechnician.avatar_url}`);
    }

    return updatedTechnician;
};

export const deactivateTechnician = async (id: string) => {
    const technician = await prisma.technician.findUnique({ where: { id } });
    if (!technician) throw new AppError('Técnico não encontrado', 404);
    await prisma.technician.update({
        where: { id },
        data: {
            active: false
        }
    });

    return 'Técnico desativado com sucesso';
};