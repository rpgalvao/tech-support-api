# Usa a imagem oficial do Node 22 Alpine
FROM node:22-alpine

# ==========================================
# 🛠️ CONFIGURAÇÕES DO PUPPETEER / CHROMIUM
# ==========================================
# Impede o Puppeteer de baixar a versão incompatível e aponta para o Chromium do Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Instala o openssl (para o Prisma), o Chromium nativo e as bibliotecas de fontes para o PDF renderizar os textos
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

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