import z from "zod";

export const loginTechnicianSchema = z.object({
    email: z.email(),
    password: z.string().min(5, 'A senha deve ter no mínimo 5 caracteres')
});