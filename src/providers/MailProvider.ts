import nodemailer from 'nodemailer';
import { AppError } from '../errors/AppError';

// Definimos uma interface clara para os parâmetros que o provider vai receber
interface SendMailDTO {
    to: string;
    subject: string;
    body: string; // Enviaremos como HTML para os links ficarem clicáveis e bonitos
}

export class MailProvider {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Inicializamos o "motor" do Nodemailer puxando as credenciais do seu .env
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    public async sendMail({ to, subject, body }: SendMailDTO): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
                to,
                subject,
                html: body,
            });

            // Um log amigável para você saber no terminal que o fluxo funcionou
            console.log(`✉️ [MailProvider] E-mail enviado com sucesso para: ${to}`);
        } catch (error) {
            console.error(`🚨 [MailProvider] Erro ao enviar e-mail:`, error);
            throw new AppError('Falha no envio de e-mail. Tente novamente mais tarde.', 500);
        }
    }
}