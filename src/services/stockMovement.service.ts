import { prisma } from "../libs/prisma";
import { AppError } from "../errors/AppError";

type CreateMovementData = {
    partId: string;
    type: "IN" | "OUT";
    quantity: number;
    reason: string;
    userId?: string | null;
    serviceOrderId?: string | null;
};

export const createMovement = async (data: CreateMovementData) => {
    // 1. Verifica se a peça existe
    const part = await prisma.part.findUnique({ where: { id: data.partId } });
    if (!part) {
        throw new AppError("Peça não encontrada.", 404);
    }

    // 2. Trava de segurança: impede saída se o estoque for insuficiente
    if (data.type === 'OUT' && part.current_stock < data.quantity) {
        throw new AppError(`Estoque insuficiente. Saldo atual: ${part.current_stock}`, 400);
    }

    // 3. Transaction: Grava o histórico e atualiza o saldo da peça de uma vez só
    const [movement, updatedPart] = await prisma.$transaction([
        prisma.stockMovement.create({ data }),
        prisma.part.update({
            where: { id: data.partId },
            data: {
                current_stock: data.type === 'IN'
                    ? part.current_stock + data.quantity
                    : part.current_stock - data.quantity
            }
        })
    ]);

    return { movement, updatedPart };
};

export const getAllMovements = async (partId?: string) => {
    return await prisma.stockMovement.findMany({
        where: partId ? { partId } : undefined,
        include: { part: true },
        orderBy: { created_at: 'desc' }
    });
};