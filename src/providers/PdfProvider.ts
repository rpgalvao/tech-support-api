import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { AppError } from '../errors/AppError';

interface GeneratePdfDTO {
    templateName: string; // Nome do arquivo .hbs (sem a extensão)
    data: any; // O objeto JSON com todos os dados da O.S. que o template vai usar
    fileName: string; // O nome final do arquivo PDF
}

export class PdfProvider {
    // Aponta para a pasta onde criamos o seu os-report.hbs
    private templatesFolder = path.resolve(process.cwd(), 'src', 'templates');

    // Aponta para a pasta onde os PDFs oficiais serão salvos
    private destFolder = path.resolve(process.cwd(), 'uploads', 'os_pdfs');

    constructor() {
        // Garante que a pasta de destino dos PDFs exista logo que o provider é chamado
        if (!fs.existsSync(this.destFolder)) {
            fs.mkdirSync(this.destFolder, { recursive: true });
        }
    }

    public async generatePdf({ templateName, data, fileName }: GeneratePdfDTO): Promise<string> {
        try {
            const templatePath = path.resolve(this.templatesFolder, `${templateName}.hbs`);

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template ${templateName} não encontrado no caminho: ${templatePath}`);
            }

            // 1. Lê o arquivo HTML (Handlebars) do HD
            const templateFile = await fs.promises.readFile(templatePath, 'utf-8');

            // 2. Compila o template usando a biblioteca
            const compileTemplate = handlebars.compile(templateFile);

            // 3. Injeta os dados da O.S. dentro das variáveis {{ }} do HTML
            const htmlContent = compileTemplate(data);

            const filePath = path.resolve(this.destFolder, fileName);

            // 4. Inicia o navegador invisível
            // As flags no-sandbox são a "mágica" para o Puppeteer rodar liso dentro do Docker!
            const browser = await puppeteer.launch({
                headless: true,
                // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });

            const page = await browser.newPage();

            // 5. Carrega o nosso HTML na página do navegador
            // networkidle0 garante que ele só vai tirar o print quando 100% do HTML (e imagens) carregar
            await page.setContent(htmlContent, { waitUntil: 'load' });

            // 6. Tira o print em PDF e salva fisicamente no HD
            await page.pdf({
                path: filePath,
                format: 'A4',
                printBackground: true, // Fundamental para aparecer as cores de fundo que colocamos no CSS
                margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
            });

            await browser.close();

            // Retorna apenas o nome do arquivo para salvarmos no banco de dados
            return fileName;

        } catch (error) {
            console.error('🚨 [PdfProvider] Erro ao gerar PDF:', error);
            throw new AppError('Não foi possível gerar o documento da Ordem de Serviço.', 500);
        }
    }
}