# Dockerfile para HospitAll Backend
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Instalar dependências de desenvolvimento para build
RUN npm install --save-dev typescript @types/node ts-node

# Compilar TypeScript
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S hospitall -u 1001

# Mudar ownership dos arquivos
RUN chown -R hospitall:nodejs /app
USER hospitall

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]