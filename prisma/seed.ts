import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword } from '../src/utils/hash';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Criptografa a senha antes de salvar
    const hashedPassword = await hashPassword('*Admin@77');

    // O upsert é seguro: ele cria se não existir, e não faz nada se já existir
    const admin = await prisma.user.upsert({
        where: { email: 'admin@rpgsistemas.com.br' },
        update: {},
        create: {
            name: 'Renato Galvao',
            email: 'admin@rpgsistemas.com.br',
            password: hashedPassword,
            role: 'ADMIN', // Garante acesso total ao sistema
            active: true,
        },
    });

    console.log('✅ Seed finalizado com sucesso!');
    console.log(`👤 Administrador criado: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error('Erro ao executar o seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });