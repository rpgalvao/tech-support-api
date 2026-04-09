# Usa a imagem oficial do Node 22 na versão Alpine (mais leve e segura)
FROM node:22-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (ajuda no cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o resto do código da sua máquina para dentro do container
COPY . .

# Expõe a porta que o nosso servidor Express vai usar
EXPOSE 3333

# Comando para iniciar o servidor usando o script dev que criamos no package.json
CMD ["npm", "run", "dev"]