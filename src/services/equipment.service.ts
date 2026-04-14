import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export const createEquipment = async (data: Prisma.EquipmentUncheckedCreateInput) => {
    if (data.customerId) {
        const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
        if (!customer) throw new AppError('Cliente não encontrado', 404);
    }

    const serialExists = await prisma.equipment.findUnique({ where: { serial_number: data.serial_number } });
    if (serialExists) throw new AppError('Número de série já cadastrado no sistema', 400);

    const equipment = await prisma.equipment.create({ data });

    return equipment;
};

export const listEquipments = async () => {
    const equipments = await prisma.equipment.findMany({
        where: { active: true },
        orderBy: { description: 'asc' },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    city: true,
                    state: true
                }
            }
        }
    });
    return equipments;
};

export const getEquipmentById = async (id: string) => {
    const equipment = await prisma.equipment.findUnique({
        where: {
            id,
            AND:
                { active: true }
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    city: true,
                    state: true
                }
            }
        }
    });
    if (!equipment) throw new AppError('Equipamento não localizado', 404);
    return equipment;
};

export const getEquipmentBySerialNumber = async (serial_number: string) => {
    const equipment = await prisma.equipment.findFirst({
        where: {
            serial_number,
            AND:
                { active: true }
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    city: true,
                    state: true
                }
            }
        }
    });
    if (!equipment) throw new AppError('Equipamento não localizado pelo número de série', 404);
    return equipment;
};

export const updateEquipment = async (id: string, data: Prisma.EquipmentUncheckedUpdateInput) => {
    if (data.serial_number) {
        const serial = data.serial_number as string;
        const serialExists = await prisma.equipment.findFirst({ where: { serial_number: serial } });
        if (serialExists) throw new AppError('Número de série já cadastrado no sistema', 400);
    }

    try {
        const updatedEquipment = await prisma.equipment.update({
            where: { id },
            data
        });
        return updatedEquipment;
    } catch (error: any) {
        if (error.code === 'P2025') throw new AppError('Equipamento não encontrado', 404);
        throw error;
    }
};

export const removeEquipment = async (id: string) => {
    try {
        await prisma.equipment.update(
            {
                where: {
                    id
                },
                data: { active: false }
            });
        return { message: 'Equipamento removido com sucesso' };
    } catch (error: any) {
        if (error.code === 'P2025') throw new AppError('Equipamento não localizado', 404);
        throw error;
    }
};