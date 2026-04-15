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

export const updateServiceOrder = async (id: string, data: Prisma.ServiceOrderUncheckedUpdateInput) => {
    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    const queries = [];
    let osDataToUpdate = { ...data };

    if (data.solution_description) {
        osDataToUpdate.closed_at = new Date();

        const equipmentUpdateQuery = prisma.equipment.update({
            where: { id: serviceOrder.equipmentId },
            data: {
                status: 'FINALIZADO',
                returned_at: new Date()
            }
        });
        queries.push(equipmentUpdateQuery);
    }

    const updateOSQuery = prisma.serviceOrder.update({
        where: { id },
        data: osDataToUpdate
    });
    queries.push(updateOSQuery);

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