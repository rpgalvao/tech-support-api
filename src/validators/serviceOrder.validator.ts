import z from "zod";

export const openServiceOrderSchema = z.object({
    customerId: z.uuid(),
    equipmentId: z.uuid(),
    problem_description: z.string().min(5).max(255),
    solution_description: z.string().optional()
});

export const serviceOrderIdSchema = z.object({
    id: z.uuid()
});

export const updateServiceOrderSchema = z.object({
    customerId: z.uuid().optional(),
    equipmentId: z.uuid().optional(),
    problem_description: z.string().min(5).max(255).optional(),
    solution_description: z.string().optional(),
    status: z.enum(['ABERTA', 'FINALIZADA', 'CANCELADA']).optional(),
    cancellation_reason: z.string().optional(),
    parts: z.array(z.object({
        part_name: z.string(),
        part_code: z.string().optional(),
        cost: z.coerce.number().optional()
    })).optional()
});

export const cancelServiceOrderSchema = z.object({
    reason: z.string('Necessário informar o motivo do cancelamento')
});