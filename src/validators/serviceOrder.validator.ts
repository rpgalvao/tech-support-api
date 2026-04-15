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
    solution_description: z.string().optional()
});
