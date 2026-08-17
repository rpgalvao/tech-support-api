import crypto from "crypto";
import { AppError } from "../errors/AppError";
import { generateToken } from "../libs/jwt";
import { prisma } from "../libs/prisma";
import { hashPassword, verifyPassword } from "../utils/hash";
import { getUserByEmail } from "./user.service";
import { MailProvider } from "../providers/MailProvider";
import { setFullURL } from "../utils/setFullUrl";

export const loginUser = async (email: string, password: string) => {
    const user = await getUserByEmail(email);
    if (!user) throw new AppError('Credenciais inválidas', 401);
    const passwordCheck = await verifyPassword(password, user.password);
    if (!passwordCheck) throw new AppError('Credenciais inválidas!', 401);
    const token = generateToken({ id: user.id, role: user.role });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url ? setFullURL(`/uploads/avatars/${user.avatar_url}`) : null,
            created_at: user.created_at
        }, token
    };
};

export const forgotPassword = async (email: string) => {
    // 1. Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });

    // Regra de Ouro de Segurança: Se o e-mail não existir, NÃO lançamos erro 404!
    // Nós retornamos silenciosamente. Isso impede que um hacker fique testando milhares de e-mails para descobrir quem tem conta no seu sistema.
    if (!user) return;

    // 2. Gera um token criptográfico aleatório (40 caracteres hexadecimais)
    const token = crypto.randomBytes(20).toString('hex');

    // 3. Define a expiração para exatamente 1 hora a partir de agora
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // 4. Salva o token no banco de dados do usuário
    await prisma.user.update({
        where: { id: user.id },
        data: {
            reset_password_token: token,
            reset_password_expires: expires
        }
    });

    // 5. Prepara o envio do e-mail
    const mailProvider = new MailProvider();

    // Usamos a variável de ambiente, ou caímos pro localhost no desenvolvimento
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/redefinir-senha?token=${token}`;

    const mailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0056b3;">Recuperação de Senha</h2>
            <p>Olá, <strong>${user.name}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema da DWL Diagnóstica.</p>
            <p>Clique no botão abaixo para criar uma nova senha. <strong>Este link é válido por apenas 1 hora.</strong></p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0056b3; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Redefinir Minha Senha
                </a>
            </div>
            <p style="font-size: 12px; color: #777;">Se você não solicitou essa alteração, por favor ignore este e-mail. Nenhuma mudança será feita na sua conta.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">Equipe @rpg Sistemas</p>
        </div>
    `;

    await mailProvider.sendMail({
        to: user.email,
        subject: 'Recuperação de Senha - DWL Diagnóstica',
        body: mailBody
    });
};

export const resetPassword = async (token: string, newPassword: string) => {
    // 1. Busca o usuário que seja dono deste token exato E que o prazo ainda não tenha vencido
    const user = await prisma.user.findFirst({
        where: {
            reset_password_token: token,
            reset_password_expires: {
                gt: new Date() // A data de expiração gravada no banco tem que ser MAIOR (greater than) que a data de agora
            }
        }
    });

    // Se não achou, ou o token foi digitado errado/inventado, ou já passou de 1 hora
    if (!user) {
        throw new AppError('Token inválido ou expirado. Por favor, solicite uma nova recuperação de senha.', 400);
    }

    // 2. Criptografa a nova senha com o bcrypt
    const hashedPassword = await hashPassword(newPassword);

    // 3. Atualiza a senha e, o MAIS IMPORTANTE, limpa a "sujeira" do token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            reset_password_token: null, // Anula o token para ele não ser usado de novo
            reset_password_expires: null // Anula a data
        }
    });
};