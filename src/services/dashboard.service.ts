import { prisma } from "../libs/prisma";

export const getDashboardMetrics = async () => {
    // 1. MÉTRICAS DOS CARDS
    const openOrders = await prisma.serviceOrder.count({ where: { status: 'ABERTA' } });
    const completedOS = await prisma.serviceOrder.count({ where: { status: 'FINALIZADA' } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const finishedOrdersThisMonth = await prisma.serviceOrder.count({
        where: {
            status: 'FINALIZADA',
            updated_at: { gte: startOfMonth }
        }
    });

    const totalEquipments = await prisma.equipment.count();

    // ==========================================
    // 2. DADOS DO GRÁFICO (Últimos 6 meses)
    // ==========================================
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Pega todas as ordens que nasceram OU foram modificadas nos últimos 6 meses
    const recentOrders = await prisma.serviceOrder.findMany({
        where: {
            OR: [
                { opened_at: { gte: sixMonthsAgo } },
                { updated_at: { gte: sixMonthsAgo } }
            ]
        },
        select: { opened_at: true, updated_at: true, closed_at: true, status: true }
    });

    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);

        const targetMonth = d.getMonth();
        const targetYear = d.getFullYear();
        const monthName = d.toLocaleString('pt-BR', { month: 'short' });

        // Abertas: Quantas ordens FORAM CRIADAS neste mês exato?
        const abertasNoMes = recentOrders.filter(order =>
            order.opened_at.getMonth() === targetMonth &&
            order.opened_at.getFullYear() === targetYear
        ).length;

        // Finalizadas: Quantas ordens FORAM CONCLUÍDAS neste mês exato?
        const finalizadasNoMes = recentOrders.filter(order => {
            if (order.status !== 'FINALIZADA') return false;

            // Se o sistema marcou a data de fechamento, usamos ela. Senão, usamos a última atualização.
            const dateToConsider = order.closed_at ? order.closed_at : order.updated_at;

            return dateToConsider.getMonth() === targetMonth &&
                dateToConsider.getFullYear() === targetYear;
        }).length;

        chartData.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            abertas: abertasNoMes,
            finalizadas: finalizadasNoMes,
        });
    }

    // 3. ATIVIDADES RECENTES (Últimas 5 atualizadas)
    const recentActivities = await prisma.serviceOrder.findMany({
        take: 5,
        orderBy: { updated_at: 'desc' },
        select: {
            id: true,
            number: true,
            status: true,
            updated_at: true,
            equipment: {
                select: { model: { select: { name: true } } }
            },
            customer: {
                select: { name: true }
            }
        }
    });

    return {
        openOrders,
        completedOS,
        totalEquipments,
        finishedOrdersThisMonth,
        chartData,
        recentActivities
    };
};