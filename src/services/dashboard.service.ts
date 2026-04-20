import { prisma } from "../libs/prisma";

export const getDashboardMetrics = async () => {
    const openOS = await prisma.serviceOrder.count({
        where: { status: 'ABERTA' }
    });

    const completedOS = await prisma.serviceOrder.count({
        where: { status: 'FINALIZADA' }
    });

    const totalEquipment = await prisma.equipment.count();

    return { openOS, completedOS, totalEquipment };
};