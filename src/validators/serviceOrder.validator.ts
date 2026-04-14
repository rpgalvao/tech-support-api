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