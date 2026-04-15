# 🛠️ @rpg Sistemas - Tech Support API

Este é o coração do sistema de gestão de assistência técnica da **@rpg Sistemas**. Uma API RESTful desenvolvida com foco em escalabilidade, segurança e automação de fluxos de trabalho para ordens de serviço.

## 🚀 Tecnologias e Conceitos Implementados

Este projeto foi construído utilizando as melhores práticas de desenvolvimento backend:

- **Node.js & TypeScript:** Tipagem forte para evitar erros em tempo de execução.
- **Express:** Framework ágil para roteamento e middlewares.
- **Prisma ORM & PostgreSQL:** Modelagem de dados complexa e migrações controladas.
- **Docker & Docker Compose:** Ambiente de desenvolvimento isolado e pronto para produção.
- **Zod:** Validação rigorosa de dados (Schema Validation) e normalização (Coerce/Transform).
- **JWT (JSON Web Tokens):** Autenticação segura e proteção de rotas por níveis de acesso.
- **Multer & Sharp:** Sistema de upload com processamento e otimização de imagens.
- **Arquitetura em Camadas:** Separação clara entre Controllers, Services, Validators e Repositories.

## ⚙️ Funcionalidades Principais

- **Gestão de Técnicos:** Cadastro com senha criptografada e upload de avatar otimizado.
- **Módulo de Clientes:** CRUD completo com histórico de equipamentos e serviços.
- **Controle de Equipamentos:** Rastreamento por número de série, com automação de status e datas de recebimento/devolução.
- **Fluxo de Ordem de Serviço (O.S.):** - Abertura, atualização e cancelamento.
    - **Transações de Banco de Dados:** Garantia de integridade ao atualizar O.S. e Equipamento simultaneamente.
    - Registro de peças substituídas com inserções aninhadas (Nested Writes).
    - Lógica de "Soft Delete" e "Cancelamento com Motivo" para auditoria.

## 🛠️ Como Rodar o Projeto

1. Clone o repositório.
2. Crie seu arquivo `.env` baseado no `.env.example`.
3. Certifique-se de que o Docker está instalado e rode:
    ```bash
    docker-compose up -d
    ```
4. A API estará disponível em http://localhost:3333

#### Desenvolvido com ☕ e foco por Renato - @rpg Sistemas.
