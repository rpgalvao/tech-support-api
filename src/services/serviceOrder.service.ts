import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export const createServiceOrder = async (data: Prisma.ServiceOrderUncheckedCreateInput) => {
    const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId }
    });
    if (!equipment) throw new AppError('Equipamento não consta na base de dados', 404);

    if (equipment.customerId !== data.customerId) throw new AppError('Esse equipamento não pertence a esse cliente', 403);

    const createServiceOrderQuery = prisma.serviceOrder.create({
        data,
        select: { equipment: true, customer: true }
    });

    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: 'REPARO' }
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
            technician: {
                select: {
                    name: true,
                    email: true,
                    phone: true
                }
            }
        },
        orderBy: { opened_at: 'asc' },
    });
    return OSList;
};

export const getServiceOrderById = async (id: string) => {
    const serviceOrder = await prisma.serviceOrder.findUnique({
        where: {
            id
        },
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
            technician: {
                select: {
                    name: true,
                    email: true,
                    phone: true
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

export const updateServiceOrder = async (id: string, payload: UpdateOSData) => {
    const { parts, ...data } = payload;

    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    const queries = [];
    let osDataToUpdate = { ...data };

    // 🏆 A NOVA INTELIGÊNCIA DE STATUS
    if (data.status === 'FINALIZADA' || data.status === 'CANCELADA') {
        // Se finalizou ou cancelou, grava a hora do fechamento
        osDataToUpdate.closed_at = new Date();

        // Mapeia o status da O.S. para o status do Equipamento (que está no seu schema.prisma)
        const equipmentStatus = data.status === 'FINALIZADA' ? 'FINALIZADO' : 'OS_CANCELADA';

        const equipmentUpdateQuery = prisma.equipment.update({
            where: { id: serviceOrder.equipmentId },
            data: {
                status: equipmentStatus,
                returned_at: new Date() // Grava a hora que a máquina ficou pronta/liberada
            }
        });
        queries.push(equipmentUpdateQuery);

    } else if (data.status === 'ABERTA') {
        // Se o técnico decidiu reabrir a O.S., nós apagamos a data de fechamento
        osDataToUpdate.closed_at = null;
        osDataToUpdate.cancellation_reason = null;

        // E voltamos o equipamento do cliente para a bancada
        const equipmentUpdateQuery = prisma.equipment.update({
            where: { id: serviceOrder.equipmentId },
            data: {
                status: 'REPARO', // Volta pra análise/reparo
                returned_at: null // Apaga a data de devolução, pois voltou pra bancada
            }
        });
        queries.push(equipmentUpdateQuery);
    }

    // A parte das peças continua igual (intocada)
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

    // Executa tudo de uma vez (O famoso comportamento do Promise.all, mas no Prisma se chama $transaction)
    const result = await prisma.$transaction(queries);

    return result[result.length - 1];
};

export const cancelServiceOrder = async (id: string, reason: string) => {
    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    const cancelServiceQuery = prisma.serviceOrder.update({
        where: { id },
        data: {
            status: 'CANCELADA',
            cancellation_reason: reason,
            closed_at: new Date()
        }
    });

    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: serviceOrder.equipmentId },
        data: { status: 'OS_CANCELADA' }
    });

    await prisma.$transaction([cancelServiceQuery, updateEquipmentQuery]);

    return { message: 'Ordem de serviço cancelada' };
};