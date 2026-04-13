import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export const createCustomer = async (data: Prisma.CustomerCreateInput) => {
    const customer = await prisma.customer.create({ data });
    if (!customer) throw new AppError('Não foi possível criar o cliente', 400);
    return customer;
};

export const getCustomersList = async () => {
    const customers = await prisma.customer.findMany({ orderBy: { created_at: 'desc' } });
    return customers;
};

export const getCustomerById = async (id: string) => {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Cliente não encontrado', 404);
    return customer;
};

export const updateCustomer = async (id: string, data: Prisma.CustomerUpdateInput) => {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Cliente não encontrado', 404);
    const updatedCustomer = await prisma.customer.update({
        where: { id },
        data
    });
    if (!updatedCustomer) throw new AppError('Erro ao atualizar o cliente', 400);
    return updatedCustomer;
};

export const deleteCustomer = async (id: string) => {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Cliente não encontrado', 404);
    await prisma.customer.delete({ where: { id } });
    return 'Cliente excluído com sucesso!';
};