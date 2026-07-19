import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

// 1. Recebemos o loggedUserId como segundo parâmetro
export const createServiceOrder = async (data: Omit<Prisma.ServiceOrderUncheckedCreateInput, 'openedById'>, loggedUserId: string) => {
    const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId }
    });
    if (!equipment) throw new AppError('Equipamento não consta na base de dados', 404);

    if (equipment.customerId !== data.customerId) throw new AppError('Esse equipamento não pertence a esse cliente', 403);

    const createServiceOrderQuery = prisma.serviceOrder.create({
        data: {
            ...data,
            openedById: loggedUserId // Injetamos com segurança quem está abrindo a O.S.
        },
        select: { equipment: true, customer: true }
    });

    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: 'REPARO' }
        // Nota: Se quiser que o equipamento vá para 'RECEBIDO' ao abrir a OS, basta trocar aqui!
    });

    const [serviceOrder, updateEquipment] = await prisma.$transaction([
        createServiceOrderQuery, updateEquipmentQuery
    ]);

    return serviceOrder;
};

export const listAllServiceOrders = async () => {
    const OSList = await prisma.serviceOrder.findMany({
        include: {
            equipment: {
                select: {
                    description: true,
                    serial_number: true,
                    received_at: true,
                    returned_at: true,
                    status: true
                }
            },
            customer: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    city: true,
                    state: true,
                    address: true
                }
            },
            // 2. Mudamos de "technician" para "openedBy" e "closedBy"
            openedBy: {
                select: {
                    name: true,
                    email: true,
                }
            },
            closedBy: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { opened_at: 'asc' },
    });
    return OSList;
};

export const getServiceOrderById = async (id: string) => {
    const serviceOrder = await prisma.serviceOrder.findUnique({
        where: { id },
        include: {
            equipment: {
                select: {
                    description: true,
                    serial_number: true,
                    received_at: true,
                    returned_at: true,
                    status: true
                }
            },
            customer: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    city: true,
                    state: true,
                    address: true
                }
            },
            // 3. Atualizando os relacionamentos aqui também
            openedBy: {
                select: {
                    name: true,
                    email: true,
                }
            },
            closedBy: {
                select: {
                    name: true,
                    email: true,
                }
            }
        }
    });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    return serviceOrder;
};

export type UpdateOSData = Prisma.ServiceOrderUncheckedUpdateInput & {
    parts?: {
        part_name: string;
        part_code?: string;
        cost?: number;
    }[];
};

// 4. Recebemos o loggedUserId para saber quem está fechando a O.S.
export const updateServiceOrder = async (id: string, payload: UpdateOSData, loggedUserId: string) => {
    const { parts, ...data } = payload;

    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    const queries = [];
    let osDataToUpdate = { ...data };

    if (data.status === 'FINALIZADA' || data.status === 'CANCELADA') {
        osDataToUpdate.closed_at = new Date();
        osDataToUpdate.closedById = loggedUserId; // Gravamos o usuário que fechou a O.S.

        const equipmentStatus = data.status === 'FINALIZADA' ? 'FINALIZADO' : 'OS_CANCELADA';

        const equipmentUpdateQuery = prisma.equipment.update({
            where: { id: serviceOrder.equipmentId },
            data: {
                status: equipmentStatus,
                returned_at: new Date()
            }
        });
        queries.push(equipmentUpdateQuery);

    }

    if (parts && parts.length > 0) {
        osDataToUpdate.parts_replaced = {
            create: parts
        };
    }

    const updateOSQuery = prisma.serviceOrder.update({
        where: { id },
        data: osDataToUpdate,
        include: {
            parts_replaced: {
                select: {
                    part_name: true,
                    part_code: true,
                    cost: true
                }
            }
        }
    });
    queries.push(updateOSQuery);

    const result = await prisma.$transaction(queries);
    return result[result.length - 1];
};

// 5. Incluímos o loggedUserId no cancelamento também
export const cancelServiceOrder = async (id: string, reason: string, loggedUserId: string) => {
    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    const cancelServiceQuery = prisma.serviceOrder.update({
        where: { id },
        data: {
            status: 'CANCELADA',
            cancellation_reason: reason,
            closed_at: new Date(),
            closedById: loggedUserId // Registra quem cancelou
        }
    });

    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: serviceOrder.equipmentId },
        data: { status: 'OS_CANCELADA' }
    });

    await prisma.$transaction([cancelServiceQuery, updateEquipmentQuery]);

    return { message: 'Ordem de serviço cancelada' };
};

export const reopenServiceOrder = async (id: string, loggedUserId: string) => {
    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    if (serviceOrder.status === 'ABERTA') {
        throw new AppError('Esta ordem de serviço já está aberta', 400);
    }

    const reopenServiceQuery = prisma.serviceOrder.update({
        where: { id },
        data: {
            status: 'ABERTA',
            closed_at: null,
            closedById: null, // Apaga o usuário que havia fechado
            cancellation_reason: null
        }
    });

    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: serviceOrder.equipmentId },
        data: {
            status: 'REPARO', // Devolve o equipamento para a bancada
            returned_at: null
        }
    });

    await prisma.$transaction([reopenServiceQuery, updateEquipmentQuery]);

    return { message: 'Ordem de serviço reaberta com sucesso' };
};