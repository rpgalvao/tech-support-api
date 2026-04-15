# Usa a imagem oficial do Node 22 Alpine
FROM node:22-alpine

# Instala o openssl para o motor do Prisma não "crashar" no Alpine
RUN apk add --no-cache openssl

# Define a pasta de trabalho
WORKDIR /app

# Copia os arquivos de dependência PRIMEIRO
COPY package*.json ./
# Copia a pasta do Prisma para ele saber como gerar o cliente
COPY prisma ./prisma/

# Instala as dependências
RUN npm install

# Copia o resto do código da máquina para o container
COPY . .

# O PULO DO GATO: Gera o Prisma Client por dentro do container!
RUN npx prisma generate

# Expõe a porta
EXPOSE 3333

# Inicia o servidor
CMD ["npm", "run", "dev"]