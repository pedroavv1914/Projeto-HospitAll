# ☁️ **HospitAll - Hospedagem em Portais Cloud**

## 🎯 **Visão Geral**

Este guia mostra como hospedar o **HospitAll** em diferentes portais cloud usando Docker, com URLs públicas e acesso pela internet.

---

## 🏆 **Melhores Opções de Hospedagem**

### **1. 🥇 DigitalOcean (Recomendado para Iniciantes)**
- **Preço**: $6-12/mês
- **Facilidade**: ⭐⭐⭐⭐⭐
- **Docker**: Suporte nativo
- **Domínio**: Incluso

### **2. 🥈 AWS (Amazon Web Services)**
- **Preço**: $10-30/mês
- **Facilidade**: ⭐⭐⭐
- **Escalabilidade**: ⭐⭐⭐⭐⭐
- **Recursos**: Completos

### **3. 🥉 Google Cloud Platform**
- **Preço**: $10-25/mês
- **Facilidade**: ⭐⭐⭐⭐
- **Performance**: ⭐⭐⭐⭐⭐
- **Créditos**: $300 grátis

### **4. 🔵 Microsoft Azure**
- **Preço**: $15-25/mês
- **Facilidade**: ⭐⭐⭐⭐
- **Integração**: ⭐⭐⭐⭐⭐
- **Recursos**: Empresariais

### **5. 💰 Alternativas Econômicas**
- **Vultr**: $6/mês
- **Linode**: $5/mês
- **Hetzner**: €4/mês

---

## 🚀 **Deploy no DigitalOcean (Passo a Passo)**

### **Passo 1: Criar Conta e Droplet**

1. **Criar conta**: https://digitalocean.com
2. **Criar Droplet**:
   - **Imagem**: Ubuntu 22.04 LTS
   - **Plano**: Basic ($12/mês - 2GB RAM, 1 CPU, 50GB SSD)
   - **Região**: New York ou Frankfurt
   - **Autenticação**: SSH Key (recomendado)

### **Passo 2: Configurar Domínio**

```bash
# No painel DigitalOcean:
# 1. Ir em "Networking" > "Domains"
# 2. Adicionar seu domínio (ex: hospitall.com)
# 3. Criar registros DNS:
#    - A record: @ -> IP_DO_DROPLET
#    - A record: www -> IP_DO_DROPLET
```

### **Passo 3: Conectar ao Servidor**

```bash
# Conectar via SSH
ssh root@SEU_IP_DROPLET

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### **Passo 4: Deploy da Aplicação**

```bash
# Criar diretório
mkdir -p /opt/hospitall
cd /opt/hospitall

# Clonar repositório (substitua pela sua URL)
git clone https://github.com/seu-usuario/hospitall.git .

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

**Arquivo `.env` para DigitalOcean:**
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hospitall_prod
DB_USER=hospitall_user
DB_PASSWORD=SuaSenhaSegura123!

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SuaSenhaRedis456!

# JWT
JWT_SECRET=sua-chave-jwt-super-secreta-aqui
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta-aqui

# Domínio
DOMAIN=hospitall.com
```

```bash
# Iniciar aplicação
docker-compose up -d

# Verificar status
docker-compose ps
```

### **Passo 5: Configurar SSL (Let's Encrypt)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot certonly --standalone -d hospitall.com -d www.hospitall.com

# Copiar certificados
cp /etc/letsencrypt/live/hospitall.com/fullchain.pem /opt/hospitall/ssl/certificate.crt
cp /etc/letsencrypt/live/hospitall.com/privkey.pem /opt/hospitall/ssl/private.key

# Reiniciar Nginx
docker-compose restart nginx
```

### **Resultado Final**
- ✅ **URL**: https://hospitall.com
- ✅ **API**: https://hospitall.com/api/health
- ✅ **Swagger**: https://hospitall.com/api-docs
- ✅ **SSL**: Certificado válido

---

## 🔵 **Deploy no Microsoft Azure (Passo a Passo)**

### **Passo 1: Criar Conta e Máquina Virtual**

1. **Criar conta**: https://portal.azure.com
2. **Ativar créditos gratuitos**: $200 por 30 dias
3. **Criar Resource Group**:
   - Nome: `hospitall-rg`
   - Região: `Brazil South` ou `East US`

4. **Criar Virtual Machine**:
   - **Nome**: `hospitall-vm`
   - **Imagem**: Ubuntu Server 22.04 LTS
   - **Tamanho**: Standard_B2s (2 vCPUs, 4GB RAM) - ~$30/mês
   - **Autenticação**: SSH public key
   - **Portas**: SSH (22), HTTP (80), HTTPS (443)

### **Passo 2: Configurar IP Público e DNS**

```bash
# No portal Azure:
# 1. Ir em "Virtual machines" > "hospitall-vm"
# 2. Networking > "Public IP address" > "Create new"
# 3. SKU: Standard, Assignment: Static
# 4. DNS name label: hospitall-app (será hospitall-app.brazilsouth.cloudapp.azure.com)
```

### **Passo 3: Conectar e Configurar Servidor**

```bash
# Conectar via SSH (substitua pelo seu IP)
ssh azureuser@hospitall-app.brazilsouth.cloudapp.azure.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker azureuser

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout e login novamente para aplicar grupo docker
exit
ssh azureuser@hospitall-app.brazilsouth.cloudapp.azure.com
```

### **Passo 4: Deploy da Aplicação**

```bash
# Criar diretório
sudo mkdir -p /opt/hospitall
sudo chown azureuser:azureuser /opt/hospitall
cd /opt/hospitall

# Clonar repositório (substitua pela sua URL)
git clone https://github.com/seu-usuario/hospitall.git .

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

**Arquivo `.env` para Azure:**
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hospitall_prod
DB_USER=hospitall_user
DB_PASSWORD=AzureHospitAll2024!

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=AzureRedis2024!

# JWT
JWT_SECRET=azure-jwt-secret-hospitall-2024
JWT_REFRESH_SECRET=azure-refresh-secret-hospitall-2024

# Azure específico
DOMAIN=hospitall-app.brazilsouth.cloudapp.azure.com
```

```bash
# Iniciar aplicação
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs se necessário
docker-compose logs backend
```

### **Passo 5: Configurar SSL com Let's Encrypt**

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Parar nginx temporariamente
docker-compose stop nginx

# Obter certificado SSL
sudo certbot certonly --standalone \
  -d hospitall-app.brazilsouth.cloudapp.azure.com

# Copiar certificados
sudo mkdir -p /opt/hospitall/ssl
sudo cp /etc/letsencrypt/live/hospitall-app.brazilsouth.cloudapp.azure.com/fullchain.pem /opt/hospitall/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/hospitall-app.brazilsouth.cloudapp.azure.com/privkey.pem /opt/hospitall/ssl/private.key
sudo chown azureuser:azureuser /opt/hospitall/ssl/*

# Reiniciar aplicação
docker-compose up -d
```

### **Passo 6: Configurar Domínio Personalizado (Opcional)**

Se você tiver um domínio próprio:

```bash
# No seu provedor de domínio (GoDaddy, Registro.br, etc):
# 1. Criar registro A apontando para o IP público do Azure
# 2. Exemplo: hospitall.com.br -> 20.206.xxx.xxx

# Atualizar certificado SSL
sudo certbot certonly --standalone -d hospitall.com.br

# Atualizar .env
DOMAIN=hospitall.com.br
```

### **Resultado Final Azure**
- ✅ **URL**: https://hospitall-app.brazilsouth.cloudapp.azure.com
- ✅ **API**: https://hospitall-app.brazilsouth.cloudapp.azure.com/api/health
- ✅ **Swagger**: https://hospitall-app.brazilsouth.cloudapp.azure.com/api-docs
- ✅ **SSL**: Certificado Let's Encrypt válido

### **Vantagens do Azure**
- 🎓 **Créditos estudantis**: $100/ano para estudantes
- 🏢 **Integração Microsoft**: Office 365, Active Directory
- 🌎 **Data centers no Brasil**: Menor latência
- 🔒 **Compliance**: LGPD, ISO 27001
- 📊 **Monitoramento**: Azure Monitor integrado

---

## 🌐 **Deploy na AWS (Amazon Web Services)**

### **Passo 1: Criar Instância EC2**

1. **Login**: https://aws.amazon.com/console
2. **EC2 Dashboard** > **Launch Instance**:
   - **Nome**: HospitAll-Production
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Tipo**: t3.small (2 vCPU, 2GB RAM)
   - **Key Pair**: Criar ou usar existente
   - **Security Group**: 
     - SSH (22) - Seu IP
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0

### **Passo 2: Configurar Elastic IP**

```bash
# No console AWS:
# 1. EC2 > Elastic IPs > Allocate Elastic IP
# 2. Associate com sua instância
# 3. Anotar o IP público
```

### **Passo 3: Configurar Route 53 (DNS)**

```bash
# No console AWS:
# 1. Route 53 > Hosted Zones > Create Hosted Zone
# 2. Domain: hospitall.com
# 3. Create Record:
#    - Type: A
#    - Name: (vazio para root)
#    - Value: SEU_ELASTIC_IP
```

### **Passo 4: Deploy**

```bash
# Conectar à instância
ssh -i sua-chave.pem ubuntu@SEU_ELASTIC_IP

# Instalar dependências
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Deploy da aplicação (mesmo processo do DigitalOcean)
sudo mkdir -p /opt/hospitall
cd /opt/hospitall
# ... resto igual ao DigitalOcean
```

### **Custo Estimado AWS**
- **EC2 t3.small**: ~$17/mês
- **Elastic IP**: $3.65/mês (se não usado)
- **Route 53**: $0.50/mês
- **Total**: ~$20/mês

---

## 🔵 **Deploy no Google Cloud Platform**

### **Passo 1: Criar VM**

```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Criar VM
gcloud compute instances create hospitall-vm \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-small \
  --zone=us-central1-a \
  --tags=http-server,https-server

# Configurar firewall
gcloud compute firewall-rules create allow-http --allow tcp:80 --source-ranges 0.0.0.0/0 --target-tags http-server
gcloud compute firewall-rules create allow-https --allow tcp:443 --source-ranges 0.0.0.0/0 --target-tags https-server
```

### **Passo 2: Conectar e Deploy**

```bash
# Conectar à VM
gcloud compute ssh hospitall-vm --zone=us-central1-a

# Deploy (mesmo processo anterior)
```

---

## 🚀 **DEPLOY COMPLETO - PROJETO FULL-STACK**

### **📋 Visão Geral do Deploy Completo**

Este processo vai colocar **TODO o projeto HospitAll** online:
- ✅ **Backend API** (Node.js + TypeScript)
- ✅ **Frontend Web** (React/Next.js)
- ✅ **Banco de Dados** (PostgreSQL)
- ✅ **Cache** (Redis)
- ✅ **Proxy Reverso** (Nginx)
- ✅ **SSL/HTTPS** automático
- ✅ **Domínio personalizado**

---

## 🏗️ **ETAPA 1: PREPARAR ESTRUTURA DO PROJETO**

### **Estrutura Final do Projeto:**
```
hospitall/
├── backend/                 # API Node.js (já existe)
├── frontend/               # React/Next.js (vamos criar)
├── docker-compose.prod.yml # Configuração produção
├── nginx.prod.conf         # Nginx para produção
├── .env.prod              # Variáveis de produção
└── deploy.sh              # Script de deploy automático
```

### **Criar Frontend Next.js:**

```bash
# No diretório do projeto
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd frontend

# Instalar dependências adicionais
npm install axios @types/axios lucide-react @headlessui/react
npm install -D @types/node
```

### **Dockerfile para Frontend:**

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### **Configurar Next.js para Produção:**

```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
```

---

## 🐳 **ETAPA 2: DOCKER COMPOSE PARA PRODUÇÃO**

### **docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  # Banco de Dados PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: hospitall-postgres-prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - hospitall-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Cache Redis
  redis:
    image: redis:7-alpine
    container_name: hospitall-redis-prod
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - hospitall-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hospitall-backend-prod
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - hospitall-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hospitall-frontend-prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
    networks:
      - hospitall-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Proxy Reverso
  nginx:
    image: nginx:alpine
    container_name: hospitall-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - hospitall-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  nginx_logs:

networks:
  hospitall-network:
    driver: bridge
```

---

## 🌐 **ETAPA 3: CONFIGURAÇÃO NGINX PRODUÇÃO**

### **nginx.prod.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Upstream backends
    upstream backend {
        server backend:3000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }
    
    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name _;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/certificate.crt;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # API Routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # CORS
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
            
            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }
        
        # API Documentation
        location /api-docs {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Frontend (Next.js)
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## ⚙️ **ETAPA 4: VARIÁVEIS DE AMBIENTE PRODUÇÃO**

### **.env.prod:**

```env
# Ambiente
NODE_ENV=production

# Domínio
DOMAIN=hospitall.com.br

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hospitall_production
DB_USER=hospitall_admin
DB_PASSWORD=HospitAll_Prod_2024!@#

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=Redis_HospitAll_2024!@#

# JWT
JWT_SECRET=hospitall-jwt-production-secret-2024-ultra-secure
JWT_REFRESH_SECRET=hospitall-refresh-production-secret-2024-ultra-secure

# API
API_PORT=3000
FRONTEND_PORT=3000

# Next.js
NEXT_PUBLIC_API_URL=https://hospitall.com.br/api
```

---

## 🚀 **ETAPA 5: SCRIPT DE DEPLOY AUTOMÁTICO**

### **deploy.sh:**

```bash
#!/bin/bash

echo "🚀 Iniciando Deploy do HospitAll..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    error "Arquivo docker-compose.prod.yml não encontrado!"
fi

# Backup do banco de dados (se existir)
log "Fazendo backup do banco de dados..."
if docker ps | grep -q "hospitall-postgres-prod"; then
    docker exec hospitall-postgres-prod pg_dump -U hospitall_admin hospitall_production > backup_$(date +%Y%m%d_%H%M%S).sql
    log "Backup criado com sucesso!"
fi

# Parar containers existentes
log "Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# Limpar imagens antigas (opcional)
read -p "Deseja limpar imagens antigas? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Limpando imagens antigas..."
    docker system prune -f
    docker image prune -f
fi

# Build das novas imagens
log "Construindo novas imagens..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Verificar se o build foi bem-sucedido
if [ $? -ne 0 ]; then
    error "Falha no build das imagens!"
fi

# Iniciar containers
log "Iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar containers ficarem saudáveis
log "Aguardando containers ficarem saudáveis..."
sleep 30

# Verificar status dos containers
log "Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

# Testar API
log "Testando API..."
sleep 10
if curl -f -s http://localhost/api/health > /dev/null; then
    log "✅ API está respondendo!"
else
    warning "⚠️  API não está respondendo ainda. Verifique os logs."
fi

# Testar Frontend
log "Testando Frontend..."
if curl -f -s http://localhost > /dev/null; then
    log "✅ Frontend está respondendo!"
else
    warning "⚠️  Frontend não está respondendo ainda. Verifique os logs."
fi

# Mostrar logs recentes
log "Logs recentes dos containers:"
docker-compose -f docker-compose.prod.yml logs --tail=20

log "🎉 Deploy concluído!"
log "🌐 Acesse: https://$(grep DOMAIN .env.prod | cut -d '=' -f2)"
log "📚 API Docs: https://$(grep DOMAIN .env.prod | cut -d '=' -f2)/api-docs"

echo ""
echo "📋 Comandos úteis:"
echo "  Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Status: docker-compose -f docker-compose.prod.yml ps"
echo "  Parar: docker-compose -f docker-compose.prod.yml down"
echo "  Reiniciar: docker-compose -f docker-compose.prod.yml restart"
```

---

## 🌐 **ETAPA 6: DEPLOY NO SERVIDOR (Azure/AWS/DigitalOcean)**

### **Processo Completo no Servidor:**

```bash
# 1. Conectar ao servidor
ssh usuario@seu-servidor.com

# 2. Instalar dependências
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clonar projeto
git clone https://github.com/seu-usuario/hospitall.git
cd hospitall

# 5. Configurar ambiente
cp .env.prod .env
nano .env  # Ajustar variáveis

# 6. Executar deploy
chmod +x deploy.sh
./deploy.sh

# 7. Configurar SSL (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d seu-dominio.com

# 8. Copiar certificados
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ./ssl/certificate.crt
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ./ssl/private.key
sudo chown $USER:$USER ./ssl/*

# 9. Reiniciar com SSL
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📊 **ETAPA 7: MONITORAMENTO E MANUTENÇÃO**

### **Script de Monitoramento (monitor.sh):**

```bash
#!/bin/bash

# Verificar saúde dos containers
check_health() {
    echo "🔍 Verificando saúde dos containers..."
    
    containers=("hospitall-postgres-prod" "hospitall-redis-prod" "hospitall-backend-prod" "hospitall-frontend-prod" "hospitall-nginx-prod")
    
    for container in "${containers[@]}"; do
        if docker ps --filter "name=$container" --filter "status=running" | grep -q $container; then
            echo "✅ $container: Rodando"
        else
            echo "❌ $container: Parado ou com problema"
            docker-compose -f docker-compose.prod.yml logs --tail=10 $container
        fi
    done
}

# Verificar uso de recursos
check_resources() {
    echo "📊 Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Verificar espaço em disco
check_disk() {
    echo "💾 Espaço em disco:"
    df -h /
    echo ""
    echo "🐳 Espaço usado pelo Docker:"
    docker system df
}

# Backup automático
backup_database() {
    echo "💾 Fazendo backup do banco..."
    backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec hospitall-postgres-prod pg_dump -U hospitall_admin hospitall_production > $backup_file
    echo "✅ Backup salvo: $backup_file"
}

# Menu principal
echo "🏥 HospitAll - Monitor de Produção"
echo "1. Verificar saúde dos containers"
echo "2. Verificar recursos"
echo "3. Verificar espaço em disco"
echo "4. Fazer backup do banco"
echo "5. Ver logs em tempo real"
echo "6. Reiniciar aplicação"

read -p "Escolha uma opção: " option

case $option in
    1) check_health ;;
    2) check_resources ;;
    3) check_disk ;;
    4) backup_database ;;
    5) docker-compose -f docker-compose.prod.yml logs -f ;;
    6) docker-compose -f docker-compose.prod.yml restart ;;
    *) echo "Opção inválida" ;;
esac
```

---

## 🎯 **RESULTADO FINAL**

Após seguir todos os passos, você terá:

### **🌐 URLs de Acesso:**
- **Site Principal**: `https://hospitall.com.br`
- **Painel Admin**: `https://hospitall.com.br/admin`
- **API REST**: `https://hospitall.com.br/api`
- **Documentação**: `https://hospitall.com.br/api-docs`

### **🏗️ Arquitetura Completa:**
```
Internet → Nginx (SSL) → Frontend (Next.js) + Backend (Node.js)
                    ↓
              PostgreSQL + Redis
```

### **✅ Recursos Implementados:**
- 🔒 **SSL/HTTPS** automático
- 🚀 **Performance** otimizada
- 📊 **Monitoramento** em tempo real
- 💾 **Backup** automático
- 🔄 **Deploy** automatizado
- 🛡️ **Segurança** profissional
- 📱 **Responsivo** mobile
- ⚡ **Cache** Redis
- 🔍 **Logs** centralizados

---

## 📞 **Próximos Passos**

1. **Criar o frontend** Next.js
2. **Configurar o servidor** (Azure/AWS/DigitalOcean)
3. **Executar o deploy** completo
4. **Configurar domínio** e SSL
5. **Testar tudo** em produção

**Quer que eu ajude a implementar alguma dessas etapas específicas?**

---

## 🐳 **Deploy com Docker Hub (Automatizado)**

### **Passo 1: Preparar Imagem**

```bash
# No seu computador local
cd /caminho/para/hospitall

# Build da imagem
docker build -t seu-usuario/hospitall:latest .

# Login no Docker Hub
docker login

# Push da imagem
docker push seu-usuario/hospitall:latest
```

### **Passo 2: Docker Compose Simplificado**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hospitall_prod
      POSTGRES_USER: hospitall_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    image: seu-usuario/hospitall:latest  # Imagem do Docker Hub
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    ports:
      - "80:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### **Passo 3: Deploy Rápido**

```bash
# No servidor
wget https://raw.githubusercontent.com/seu-usuario/hospitall/main/docker-compose.prod.yml

# Configurar variáveis
echo "DB_PASSWORD=suasenha123" > .env
echo "REDIS_PASSWORD=suasenha456" >> .env

# Iniciar
docker-compose -f docker-compose.prod.yml up -d
```

---

## 💰 **Comparação de Custos (Mensal)**

| Provedor | Configuração | Preço | Facilidade | Recomendação |
|----------|-------------|-------|------------|--------------|
| **Microsoft Azure** | Standard_B2s | $25 | ⭐⭐⭐⭐ | **Brasil/Estudantes** |
| **DigitalOcean** | 2GB RAM, 1 CPU | $12 | ⭐⭐⭐⭐⭐ | **Iniciantes** |
| **AWS EC2** | t3.small | $17 | ⭐⭐⭐ | **Empresas** |
| **Google Cloud** | e2-small | $15 | ⭐⭐⭐⭐ | **Performance** |
| **Vultr** | 2GB RAM | $6 | ⭐⭐⭐⭐ | **Econômico** |
| **Linode** | 2GB RAM | $12 | ⭐⭐⭐⭐ | **Alternativa** |

---

## 🔧 **Configurações Adicionais**

### **Monitoramento Simples**

```bash
# Script de monitoramento
nano /opt/hospitall/monitor-simple.sh
```

```bash
#!/bin/bash
# Monitor simples para cloud

# Verificar se aplicação responde
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ HospitAll OK - $(date)"
else
    echo "❌ HospitAll DOWN - $(date)"
    # Reiniciar se necessário
    docker-compose restart backend
fi
```

### **Backup Automático para Cloud**

```bash
# Backup para DigitalOcean Spaces
s3cmd put /opt/hospitall/backups/db_$(date +%Y%m%d).sql \
  s3://seu-bucket/backups/

# Backup para AWS S3
aws s3 cp /opt/hospitall/backups/ \
  s3://seu-bucket/backups/ --recursive
```

---

## 🚀 **Resultado Final**

Após seguir este guia, você terá:

✅ **HospitAll rodando na internet**  
✅ **URL pública acessível** (ex: https://hospitall.com)  
✅ **SSL/HTTPS configurado**  
✅ **Banco de dados seguro**  
✅ **Backups automáticos**  
✅ **Monitoramento básico**  

### **URLs de Acesso:**
- 🌐 **Site**: https://seu-dominio.com
- 📚 **API Docs**: https://seu-dominio.com/api-docs
- 🔍 **Health Check**: https://seu-dominio.com/api/health

---

## 📞 **Próximos Passos**

1. **Escolher provedor** (recomendo DigitalOcean para começar)
2. **Registrar domínio** (se não tiver)
3. **Seguir o passo a passo** do provedor escolhido
4. **Testar a aplicação** online
5. **Configurar monitoramento** e backups

**Qual provedor você gostaria de usar? Posso ajudar com o processo específico!**

---

**☁️ HospitAll - Hospedagem Cloud**  
*Seu sistema hospitalar na internet, acessível de qualquer lugar!*