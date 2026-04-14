import z from "zod";

export const createEquipmentSchema = z.object({
    customerId: z.uuid().optional(),
    serial_number: z.string().min(2, 'O número de série do equipamento precisa ter pelo menos 2 caracteres'),
    description: z.string().min(2, 'O nome do equipamento precisa ter pelo menos 2 caracteres'),
    status: z.enum(['EM_ANALISE', 'REPARO', 'FINALIZADO']).optional(),
});

export const getEquipmentIdSchema = z.object({
    id: z.uuid()
});

export const getEquipmentSerialNumberSchema = z.object({
    serial_number: z.string().min(2, 'O número de série do equipamento precisa ter pelo menos 2 caracteres')
});

export const updateEquipmentSchema = z.object({
    customerId: z.uuid().optional(),
    serial_number: z.string().min(2, 'O número de série do equipamento precisa ter pelo menos 2 caracteres').optional(),
    description: z.string().min(2, 'O nome do equipamento precisa ter pelo menos 2 caracteres').optional(),
    status: z.enum(['EM_ANALISE', 'REPARO', 'FINALIZADO']).optional(),
});