# 🐳 **HospitAll - Guia Completo de Deploy Docker em Produção**

## 📋 **Índice**
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Ambiente](#preparação-do-ambiente)
3. [Configuração de Segurança](#configuração-de-segurança)
4. [Deploy Passo a Passo](#deploy-passo-a-passo)
5. [Configuração SSL/HTTPS](#configuração-sslhttps)
6. [Monitoramento e Logs](#monitoramento-e-logs)
7. [Backup e Recuperação](#backup-e-recuperação)
8. [Manutenção e Atualizações](#manutenção-e-atualizações)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 **Pré-requisitos**

### **Servidor de Produção**
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Mínimo 4GB (Recomendado 8GB+)
- **CPU**: 2+ cores
- **Armazenamento**: 50GB+ SSD
- **Rede**: IP público com portas 80, 443, 22 abertas

### **Software Necessário**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar utilitários
sudo apt install -y git nginx certbot python3-certbot-nginx htop
```

---

## 🛠️ **Preparação do Ambiente**

### **1. Clonar o Repositório**
```bash
# Criar diretório para aplicação
sudo mkdir -p /opt/hospitall
sudo chown $USER:$USER /opt/hospitall
cd /opt/hospitall

# Clonar repositório
git clone https://github.com/seu-usuario/hospitall.git .
```

### **2. Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de produção
nano .env
```

**Arquivo `.env` para Produção:**
```env
# ===========================================
# HOSPITALL - CONFIGURAÇÃO DE PRODUÇÃO
# ===========================================

# Ambiente
NODE_ENV=production
PORT=3000

# Database PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hospitall_prod
DB_USER=hospitall_user
DB_PASSWORD=SuaSenhaSeguraAqui123!@#

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SuaSenhaRedisSegura456!@#

# JWT Secrets (GERAR CHAVES SEGURAS)
JWT_SECRET=sua-chave-jwt-super-secreta-256-bits-aqui
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta-256-bits-aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# Domínio (substitua pelo seu)
DOMAIN=hospitall.seudominio.com
```

### **3. Gerar Senhas Seguras**
```bash
# Gerar senha para PostgreSQL
openssl rand -base64 32

# Gerar senha para Redis
openssl rand -base64 32

# Gerar JWT Secret
openssl rand -base64 64

# Gerar JWT Refresh Secret
openssl rand -base64 64
```

---

## 🔒 **Configuração de Segurança**

### **1. Configurar Firewall**
```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### **2. Configurar Fail2Ban**
```bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Configurar jail local
sudo nano /etc/fail2ban/jail.local
```

**Conteúdo do `/etc/fail2ban/jail.local`:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

### **3. Configurar Limites do Sistema**
```bash
# Editar limits.conf
sudo nano /etc/security/limits.conf

# Adicionar no final:
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
```

---

## 🚀 **Deploy Passo a Passo**

### **Passo 1: Preparar Diretórios**
```bash
# Criar diretórios necessários
mkdir -p /opt/hospitall/logs
mkdir -p /opt/hospitall/backups
mkdir -p /opt/hospitall/ssl
mkdir -p /opt/hospitall/data/postgres
mkdir -p /opt/hospitall/data/redis

# Definir permissões
sudo chown -R $USER:docker /opt/hospitall
chmod -R 755 /opt/hospitall
```

### **Passo 2: Configurar Docker Compose para Produção**
```bash
# Editar docker-compose.yml se necessário
nano docker-compose.yml
```

### **Passo 3: Build e Deploy**
```bash
# Fazer pull das imagens base
docker-compose pull

# Build da aplicação
docker-compose build --no-cache

# Iniciar em modo detached
docker-compose up -d

# Verificar status
docker-compose ps
docker-compose logs
```

### **Passo 4: Verificar Saúde dos Containers**
```bash
# Verificar logs em tempo real
docker-compose logs -f

# Verificar saúde individual
docker-compose exec backend curl http://localhost:3000/health
docker-compose exec postgres pg_isready -U hospitall_user
docker-compose exec redis redis-cli ping
```

---

## 🔐 **Configuração SSL/HTTPS**

### **Método 1: Let's Encrypt (Recomendado)**
```bash
# Parar Nginx temporariamente
sudo systemctl stop nginx

# Obter certificado SSL
sudo certbot certonly --standalone -d hospitall.seudominio.com

# Copiar certificados para o projeto
sudo cp /etc/letsencrypt/live/hospitall.seudominio.com/fullchain.pem /opt/hospitall/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/hospitall.seudominio.com/privkey.pem /opt/hospitall/ssl/private.key

# Ajustar permissões
sudo chown $USER:docker /opt/hospitall/ssl/*
chmod 644 /opt/hospitall/ssl/certificate.crt
chmod 600 /opt/hospitall/ssl/private.key
```

### **Método 2: Certificado Próprio (Desenvolvimento)**
```bash
# Gerar certificado auto-assinado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/hospitall/ssl/private.key \
  -out /opt/hospitall/ssl/certificate.crt \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=HospitAll/CN=hospitall.seudominio.com"
```

### **Configurar Renovação Automática**
```bash
# Criar script de renovação
sudo nano /opt/hospitall/renew-ssl.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/hospitall.seudominio.com/fullchain.pem /opt/hospitall/ssl/certificate.crt
cp /etc/letsencrypt/live/hospitall.seudominio.com/privkey.pem /opt/hospitall/ssl/private.key
docker-compose -f /opt/hospitall/docker-compose.yml restart nginx
```

```bash
# Tornar executável
chmod +x /opt/hospitall/renew-ssl.sh

# Adicionar ao crontab
sudo crontab -e
# Adicionar linha: 0 3 * * * /opt/hospitall/renew-ssl.sh
```

---

## 📊 **Monitoramento e Logs**

### **1. Configurar Logrotate**
```bash
sudo nano /etc/logrotate.d/hospitall
```

**Conteúdo:**
```
/opt/hospitall/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/hospitall/docker-compose.yml restart backend
    endscript
}
```

### **2. Script de Monitoramento**
```bash
nano /opt/hospitall/monitor.sh
```

**Conteúdo:**
```bash
#!/bin/bash
# Monitor HospitAll

echo "=== HospitAll Health Check - $(date) ==="

# Verificar containers
echo "--- Container Status ---"
docker-compose -f /opt/hospitall/docker-compose.yml ps

# Verificar uso de recursos
echo "--- Resource Usage ---"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Verificar logs de erro
echo "--- Recent Errors ---"
docker-compose -f /opt/hospitall/docker-compose.yml logs --tail=10 | grep -i error

# Verificar conectividade
echo "--- API Health ---"
curl -s http://localhost/api/health || echo "API não responde"

echo "=== End Health Check ==="
```

```bash
chmod +x /opt/hospitall/monitor.sh

# Executar a cada 5 minutos
crontab -e
# Adicionar: */5 * * * * /opt/hospitall/monitor.sh >> /opt/hospitall/logs/monitor.log 2>&1
```

---

## 💾 **Backup e Recuperação**

### **1. Script de Backup Automático**
```bash
nano /opt/hospitall/backup.sh
```

**Conteúdo:**
```bash
#!/bin/bash
# Backup HospitAll

BACKUP_DIR="/opt/hospitall/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do banco PostgreSQL
docker-compose -f /opt/hospitall/docker-compose.yml exec -T postgres \
  pg_dump -U hospitall_user hospitall_prod > "$BACKUP_DIR/db_$DATE.sql"

# Backup dos volumes
docker run --rm -v hospitall_postgres_data:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/postgres_volume_$DATE.tar.gz -C /data .

docker run --rm -v hospitall_redis_data:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/redis_volume_$DATE.tar.gz -C /data .

# Backup da aplicação
tar czf "$BACKUP_DIR/app_$DATE.tar.gz" -C /opt/hospitall \
  --exclude=backups --exclude=data --exclude=logs .

# Limpar backups antigos (manter 7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

```bash
chmod +x /opt/hospitall/backup.sh

# Executar diariamente às 2h
crontab -e
# Adicionar: 0 2 * * * /opt/hospitall/backup.sh >> /opt/hospitall/logs/backup.log 2>&1
```

### **2. Procedimento de Restauração**
```bash
# Parar aplicação
docker-compose down

# Restaurar banco
docker-compose up -d postgres
sleep 10
cat backup_YYYYMMDD_HHMMSS.sql | docker-compose exec -T postgres \
  psql -U hospitall_user hospitall_prod

# Restaurar volumes se necessário
docker run --rm -v hospitall_postgres_data:/data -v /opt/hospitall/backups:/backup \
  alpine tar xzf /backup/postgres_volume_YYYYMMDD_HHMMSS.tar.gz -C /data

# Reiniciar aplicação
docker-compose up -d
```

---

## 🔄 **Manutenção e Atualizações**

### **1. Script de Atualização**
```bash
nano /opt/hospitall/update.sh
```

**Conteúdo:**
```bash
#!/bin/bash
# Atualizar HospitAll

echo "Iniciando atualização..."

# Backup antes da atualização
/opt/hospitall/backup.sh

# Fazer pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose build --no-cache
docker-compose up -d

# Verificar saúde
sleep 30
curl -f http://localhost/api/health || {
  echo "Falha na atualização, restaurando backup..."
  # Procedimento de rollback aqui
  exit 1
}

echo "Atualização concluída com sucesso!"
```

### **2. Limpeza de Sistema**
```bash
# Script de limpeza semanal
nano /opt/hospitall/cleanup.sh
```

**Conteúdo:**
```bash
#!/bin/bash
# Limpeza do sistema

# Limpar imagens Docker não utilizadas
docker image prune -f

# Limpar volumes órfãos
docker volume prune -f

# Limpar logs antigos
find /opt/hospitall/logs -name "*.log" -mtime +30 -delete

# Limpar cache do sistema
sync && echo 3 > /proc/sys/vm/drop_caches

echo "Limpeza concluída"
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns**

#### **1. Container não inicia**
```bash
# Verificar logs detalhados
docker-compose logs container_name

# Verificar recursos do sistema
free -h
df -h

# Verificar portas em uso
netstat -tulpn | grep :3000
```

#### **2. Erro de conexão com banco**
```bash
# Verificar se PostgreSQL está rodando
docker-compose exec postgres pg_isready

# Testar conexão manual
docker-compose exec postgres psql -U hospitall_user -d hospitall_prod

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DB_
```

#### **3. Problemas de SSL**
```bash
# Verificar certificados
openssl x509 -in /opt/hospitall/ssl/certificate.crt -text -noout

# Testar SSL
curl -I https://hospitall.seudominio.com

# Verificar logs do Nginx
docker-compose logs nginx
```

#### **4. Performance baixa**
```bash
# Monitorar recursos
htop
docker stats

# Verificar logs de erro
docker-compose logs | grep -i error

# Otimizar PostgreSQL
docker-compose exec postgres psql -U hospitall_user -d hospitall_prod -c "VACUUM ANALYZE;"
```

### **Comandos Úteis**

```bash
# Status geral
docker-compose ps
docker-compose top

# Logs em tempo real
docker-compose logs -f

# Executar comandos nos containers
docker-compose exec backend bash
docker-compose exec postgres psql -U hospitall_user hospitall_prod

# Reiniciar serviço específico
docker-compose restart backend

# Atualizar apenas um serviço
docker-compose up -d --no-deps backend

# Verificar uso de recursos
docker system df
docker system events
```

---

## 📞 **Suporte e Contatos**

### **Logs Importantes**
- **Aplicação**: `/opt/hospitall/logs/app.log`
- **Nginx**: `docker-compose logs nginx`
- **PostgreSQL**: `docker-compose logs postgres`
- **Sistema**: `/var/log/syslog`

### **Comandos de Emergência**
```bash
# Parar tudo
docker-compose down

# Reiniciar tudo
docker-compose up -d

# Backup de emergência
/opt/hospitall/backup.sh

# Restaurar último backup
# (seguir procedimento de restauração)
```

---

**🏥 HospitAll - Deploy Docker em Produção**  
*Guia completo para deploy seguro e profissional*

**Versão**: 1.0  
**Última atualização**: $(date +%Y-%m-%d)