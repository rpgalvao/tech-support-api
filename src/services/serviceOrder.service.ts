import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export const createServiceOrder = async (data: Omit<Prisma.ServiceOrderUncheckedCreateInput, 'openedById'>, loggedUserId: string) => {
    // 1. Buscamos o equipamento (agora precisamos do modelId para o checklist)
    const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId },
        select: { id: true, customerId: true, modelId: true } // Pegamos o modelId!
    });

    if (!equipment) throw new AppError('Equipamento não consta na base de dados', 404);
    if (equipment.customerId !== data.customerId) throw new AppError('Esse equipamento não pertence a esse cliente', 403);

    // 2. A Inteligência do Checklist
    // Preparamos o objeto que vai criar a folha de respostas, se necessário
    let checklistData: Prisma.ServiceOrderChecklistCreateNestedOneWithoutServiceOrderInput | undefined = undefined;

    // Só geramos checklist se for Preventiva ou Instalação
    if (data.type === 'PREVENTIVA' || data.type === 'INSTALACAO') {
        const template = await prisma.checklistTemplate.findFirst({
            where: {
                modelId: equipment.modelId,
                active: true // Só pega se o gabarito estiver ativo
            },
            include: {
                questions: { orderBy: { order: 'asc' } }
            }
        });

        // Se encontrou um gabarito com perguntas, montamos o "copy-paste"
        if (template && template.questions.length > 0) {
            checklistData = {
                create: {
                    answers: {
                        create: template.questions.map(q => ({
                            question_text: q.text,
                            order: q.order,
                            is_ok: false // Valor padrão inicial
                        }))
                    }
                }
            };
        }
    }

    // 3. Montamos as queries para a transação
    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: 'REPARO' }
    });

    const createServiceOrderQuery = prisma.serviceOrder.create({
        data: {
            ...data,
            openedById: loggedUserId,
            checklist: checklistData // Injeta o checklist clonado aqui (se existir)
        },
        include: {
            equipment: { include: { model: true } },
            customer: true,
            checklist: { include: { answers: true } } // Retorna a O.S. já com as perguntas para o frontend ver!
        }
    });

    // 4. Executamos tudo em uma única tacada
    const [updateEquipment, serviceOrder] = await prisma.$transaction([
        updateEquipmentQuery,
        createServiceOrderQuery
    ]);

    return serviceOrder;
};

export const listAllServiceOrders = async () => {
    const OSList = await prisma.serviceOrder.findMany({
        include: {
            equipment: {
                select: {
                    // description: true, <-- REMOVIDO PARA NÃO QUEBRAR
                    serial_number: true,
                    received_at: true,
                    returned_at: true,
                    status: true,
                    model: {          // <-- NOVO: Busca o nome do modelo no catálogo!
                        select: { name: true }
                    }
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
            openedBy: { select: { name: true, email: true } },
            closedBy: { select: { name: true, email: true } }
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
                    // description: true, <-- REMOVIDO PARA NÃO QUEBRAR
                    serial_number: true,
                    received_at: true,
                    returned_at: true,
                    status: true,
                    model: {          // <-- NOVO: Busca o nome do modelo no catálogo!
                        select: { name: true }
                    }
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
            openedBy: { select: { name: true, email: true } },
            closedBy: { select: { name: true, email: true } },
            // NOVO: Ao buscar a O.S., já trazemos as respostas do checklist preenchidas/vazias
            checklist: {
                include: {
                    answers: { orderBy: { order: 'asc' } }
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

export const updateServiceOrder = async (id: string, payload: UpdateOSData, loggedUserId: string) => {
    const { parts, ...data } = payload;

    // 1. Buscamos a O.S. já trazendo os dados do checklist anexado
    const serviceOrder = await prisma.serviceOrder.findUnique({
        where: { id },
        include: { checklist: true } // <-- INCLUÍDO AQUI
    });

    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    // 🛡️ TRAVA DE SEGURANÇA DO CHECKLIST
    if (data.status === 'FINALIZADA') {
        console.log(serviceOrder.checklist);
        // Se a O.S. possui um checklist, mas ele não tem data de conclusão (não foi respondido)
        if (serviceOrder.checklist && !serviceOrder.checklist.completed_at) {
            throw new AppError('Acesso negado. Não é possível finalizar a Ordem de Serviço pois o checklist obrigatório ainda não foi preenchido.', 403);
        }
    }

    const queries = [];
    let osDataToUpdate = { ...data };

    if (data.status === 'FINALIZADA' || data.status === 'CANCELADA') {
        osDataToUpdate.closed_at = new Date();
        osDataToUpdate.closedById = loggedUserId;

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
                select: { part_name: true, part_code: true, cost: true }
            }
        }
    });
    queries.push(updateOSQuery);

    const result = await prisma.$transaction(queries);
    return result[result.length - 1];
};

export const cancelServiceOrder = async (id: string, reason: string, loggedUserId: string) => {
    // (O conteúdo desta função permanece inalterado, está perfeito)
    const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!serviceOrder) throw new AppError('Ordem de serviço não encontrada', 404);

    const cancelServiceQuery = prisma.serviceOrder.update({
        where: { id },
        data: {
            status: 'CANCELADA',
            cancellation_reason: reason,
            closed_at: new Date(),
            closedById: loggedUserId
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
    // (O conteúdo desta função permanece inalterado, está perfeito)
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
            closedById: null,
            cancellation_reason: null
        }
    });

    const updateEquipmentQuery = prisma.equipment.update({
        where: { id: serviceOrder.equipmentId },
        data: {
            status: 'REPARO',
            returned_at: null
        }
    });

    await prisma.$transaction([reopenServiceQuery, updateEquipmentQuery]);

    return { message: 'Ordem de serviço reaberta com sucesso' };
};

export const updateServiceOrderChecklist = async (
    serviceOrderId: string,
    payload: { notes?: string, answers: { id: string, is_ok: boolean, comment?: string; }[]; }
) => {
    // 1. Verificamos se a O.S. existe e se ela tem um checklist atrelado
    const os = await prisma.serviceOrder.findUnique({
        where: { id: serviceOrderId },
        include: { checklist: true }
    });

    if (!os || !os.checklist) {
        throw new AppError('Checklist não encontrado para esta ordem de serviço', 404);
    }

    const queries = [];

    // 2. Preparamos a atualização das notas gerais do checklist
    queries.push(prisma.serviceOrderChecklist.update({
        where: { id: os.checklist.id },
        data: {
            notes: payload.notes,
            completed_at: new Date() // Marcamos a data e hora que o técnico finalizou
        }
    }));

    // 3. Preparamos a atualização de cada resposta individualmente
    for (const answer of payload.answers) {
        queries.push(prisma.checklistAnswer.update({
            where: { id: answer.id },
            data: {
                is_ok: answer.is_ok,
                comment: answer.comment
            }
        }));
    }

    // 4. Disparamos a transação: ou salva todas as respostas, ou não salva nenhuma
    await prisma.$transaction(queries);

    return { message: 'Checklist preenchido e salvo com sucesso' };
};