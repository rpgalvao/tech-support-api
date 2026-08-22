# 🛠️ @rpg Sistemas - Tech Support API (v2.0)

Este é o coração do sistema de gestão de assistência técnica da **@rpg Sistemas**. Uma API RESTful desenvolvida com foco em escalabilidade, segurança e automação de fluxos de trabalho para ordens de serviço.

A versão 2.0 introduz geração nativa de PDFs, motor de checklists dinâmicos, captura de assinaturas e suporte nativo a banco de dados serverless.

## 🚀 Tecnologias e Conceitos Implementados

Este projeto foi construído utilizando as melhores práticas de desenvolvimento backend:

- **Node.js & TypeScript:** Tipagem forte e segurança em tempo de compilação.
- **Express & Zod:** Roteamento ágil acoplado a validação rigorosa (Schema Validation).
- **Prisma ORM & PostgreSQL:** Modelagem de dados relacional (otimizado para Neon Serverless via `@prisma/adapter-pg`).
- **Puppeteer & Handlebars:** Geração nativa e estilizada de relatórios em PDF.
- **JWT & Bcrypt:** Autenticação segura com RBAC (Controle de Acesso Baseado em Perfis - ADMIN / TECHNICIAN).
- **Nodemailer:** Motor de envio de e-mails transacionais (ex: recuperação de senha).
- **Multer & Sharp:** Upload, processamento e otimização de imagens (Avatares e Assinaturas).

## ⚙️ Funcionalidades Principais

- **Gestão de Usuários e Acessos:** Autenticação segura com separação de privilégios entre Administradores e Técnicos.
- **Módulo de Clientes e Equipamentos:** CRUD completo, rastreamento de número de série e captura automática de endereços (ViaCEP).
- **Controle de Estoque:** Gestão de peças e histórico de movimentações atreladas ao uso nas Ordens de Serviço.
- **Motor de Ordem de Serviço (O.S.):**
    - Ciclo de vida completo (Abertura, Atualização, Fechamento e Cancelamento Seguro).
    - Execução de **Checklists Dinâmicos** baseados no modelo do equipamento.
    - Registro de peças, mão de obra, deslocamento e cálculo automático de totais.
- **Assinaturas e Exportação:**
    - Captura e injeção em Base64 da assinatura do Técnico e do Cliente.
    - Geração de laudo técnico em PDF e formatação de links dinâmicos para envio via **WhatsApp**.

## 🛠️ Como Rodar o Projeto (Local & Homologação)

1. Clone o repositório e instale as dependências:
    ```bash
    npm install
    ```
2. Configure suas variáveis de ambiente copiando o arquivo de exemplo:

    ```bash
        cp .env.example .env
    ```

#### Gerenciamento do Banco de Dados

1. Para aplicar a estrutura em um banco de produção/homologação já existente:
    ```bash
    npx prisma migrate deploy
    ```
2. Para criar a estrutura do zero em desenvolvimento local (e rodar os seeds iniciais):
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```
3. Inicie o servidor em modo de desenvolvimento
    ```bash
    npm run dev
    ```

A API estará disponível em http://localhost:3333.

### Desenvolvido com ☕ e foco por @rpg Sistemas.
