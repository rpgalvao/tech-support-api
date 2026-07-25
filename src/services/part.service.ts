import { prisma } from "../libs/prisma";
import { AppError } from "../errors/AppError";

type CreatePartData = {
    name: string;
    sku?: string;
    cost_price: number;
    sale_price: number;
    current_stock?: number;
    min_stock?: number;
    supplierId?: string | null;
};

export const createPart = async (data: CreatePartData) => {
    return await prisma.part.create({ data });
};

export const getAllParts = async (includeInactive = false) => {
    return await prisma.part.findMany({
        where: includeInactive ? undefined : { active: true },
        include: { supplier: true }, // Traz os dados do fornecedor junto
        orderBy: { name: 'asc' }
    });
};

export const getPartById = async (id: string) => {
    return await prisma.part.findUnique({
        where: { id },
        include: { supplier: true }
    });
};

export const updatePart = async (id: string, data: Partial<CreatePartData & { active: boolean; }>) => {
    const partExists = await prisma.part.findUnique({ where: { id } });
    if (!partExists) {
        throw new AppError("Peça não encontrada.", 404);
    }

    return await prisma.part.update({
        where: { id },
        data
    });
};

export const deletePart = async (id: string) => {
    const partExists = await prisma.part.findUnique({ where: { id } });
    if (!partExists) {
        throw new AppError("Peça não encontrada.", 404);
    }

    // Soft Delete
    return await prisma.part.update({
        where: { id },
        data: { active: false }
    });
};