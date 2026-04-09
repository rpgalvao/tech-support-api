import z from "zod";

export const createTechnicianSchema = z.object({
    name: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres'),
    email: z.email('E-mail informado é inválido'),
    password: z.string().min(5, 'A senha deve conter pelo menos 5 caracteres'),
    phone: z.string().optional()
});