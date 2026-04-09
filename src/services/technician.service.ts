import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { hashPassword } from "../utils/hash";


export const createUser = async (data: Prisma.TechnicianCreateInput) => {
    const emailExists = await prisma.technician.findUnique({ where: { email: data.email } });
    if (emailExists) throw new Error('E-mail informado já existe no sistema');

    const hashedPassword = await hashPassword(data.password);

    const newTechnician = await prisma.technician.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            phone: data.phone
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            created_at: true
        }
    });

    return newTechnician;
};