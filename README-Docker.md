# 🐳 **HospitAll - Configuração Docker**

## 📋 **Visão Geral**

Este projeto inclui uma configuração completa do Docker para facilitar o desenvolvimento e deploy da aplicação HospitAll.

## 🏗️ **Arquitetura dos Containers**

### **Produção (`docker-compose.yml`)**
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e gerenciamento de sessões
- **Backend**: API Node.js/TypeScript
- **Nginx**: Proxy reverso e load balancer

### **Desenvolvimento (`docker-compose.dev.yml`)**
- **PostgreSQL Dev**: Banco isolado para desenvolvimento
- **Redis Dev**: Cache para desenvolvimento
- **Backend Dev**: API com hot reload

## 🚀 **Como Usar**

### **1. Desenvolvimento**

```bash
# Iniciar ambiente de desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Parar ambiente
docker-compose -f docker-compose.dev.yml down
```

**URLs de Desenvolvimento:**
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`

### **2. Produção**

```bash
# Iniciar ambiente de produção
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar ambiente
docker-compose down
```

**URLs de Produção:**
- Aplicação: `http://localhost` (Nginx)
- API: `http://localhost/api`
- Swagger: `http://localhost/api-docs`

## 🔧 **Comandos Úteis**

### **Gerenciamento de Containers**

```bash
# Ver status dos containers
docker-compose ps

# Rebuild de um serviço específico
docker-compose build backend

# Executar comando em container
docker-compose exec backend npm run migrate

# Ver logs de um serviço específico
docker-compose logs -f postgres

# Limpar volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### **Banco de Dados**

```bash
# Conectar ao PostgreSQL (desenvolvimento)
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U dev_user -d hospitall_dev

# Conectar ao PostgreSQL (produção)
docker-compose exec postgres psql -U hospitall_user -d hospitall_db

# Backup do banco
docker-compose exec postgres pg_dump -U hospitall_user hospitall_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U hospitall_user hospitall_db < backup.sql
```

### **Redis**

```bash
# Conectar ao Redis (desenvolvimento)
docker-compose -f docker-compose.dev.yml exec redis-dev redis-cli

# Conectar ao Redis (produção)
docker-compose exec redis redis-cli -a hospitall_redis_password

# Ver estatísticas do Redis
docker-compose exec redis redis-cli -a hospitall_redis_password info
```

## 🔐 **Variáveis de Ambiente**

### **Desenvolvimento**
As variáveis estão pré-configuradas no `docker-compose.dev.yml` para facilitar o desenvolvimento.

### **Produção**
**⚠️ IMPORTANTE**: Altere as seguintes variáveis antes do deploy:

```bash
# No docker-compose.yml, altere:
POSTGRES_PASSWORD=sua_senha_segura
JWT_SECRET=sua_chave_jwt_super_secreta
JWT_REFRESH_SECRET=sua_chave_refresh_super_secreta
REDIS_PASSWORD=sua_senha_redis_segura
```

## 📁 **Estrutura de Arquivos Docker**

```
├── Dockerfile              # Build de produção
├── Dockerfile.dev          # Build de desenvolvimento
├── docker-compose.yml      # Orquestração de produção
├── docker-compose.dev.yml  # Orquestração de desenvolvimento
├── .dockerignore           # Arquivos ignorados no build
├── nginx.conf              # Configuração do Nginx
├── init-db.sql             # Script de inicialização do PostgreSQL
└── README-Docker.md        # Esta documentação
```

## 🔍 **Monitoramento e Logs**

### **Logs Estruturados**
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Últimas 100 linhas
docker-compose logs --tail=100 backend
```

### **Health Checks**
Todos os serviços incluem health checks:

```bash
# Ver status de saúde
docker-compose ps

# Testar health check manualmente
curl http://localhost:3000/health
```

## 🛡️ **Segurança**

### **Configurações Implementadas**
- ✅ Usuários não-root nos containers
- ✅ Rate limiting no Nginx
- ✅ Headers de segurança HTTP
- ✅ Isolamento de rede entre serviços
- ✅ Volumes persistentes para dados
- ✅ Secrets gerenciados via environment

### **Para Produção**
1. **Altere todas as senhas padrão**
2. **Configure SSL/HTTPS no Nginx**
3. **Use Docker Secrets para dados sensíveis**
4. **Configure firewall adequado**
5. **Implemente backup automático**

## 🚨 **Troubleshooting**

### **Problemas Comuns**

**1. Porta já em uso**
```bash
# Verificar portas em uso
netstat -tulpn | grep :3000

# Alterar porta no docker-compose.yml
ports:
  - "3001:3000"  # Usar porta 3001 no host
```

**2. Problemas de permissão**
```bash
# Recriar containers com permissões corretas
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**3. Banco não conecta**
```bash
# Verificar logs do PostgreSQL
docker-compose logs postgres

# Testar conexão
docker-compose exec backend npm run migrate
```

**4. Container não inicia**
```bash
# Ver logs detalhados
docker-compose logs backend

# Executar em modo interativo
docker-compose run --rm backend sh
```

## 📊 **Performance**

### **Otimizações Implementadas**
- Multi-stage builds para imagens menores
- Cache de dependências npm
- Compressão gzip no Nginx
- Connection pooling no PostgreSQL
- Redis para cache de sessões

### **Monitoramento**
```bash
# Uso de recursos
docker stats

# Espaço em disco
docker system df

# Limpeza de recursos não utilizados
docker system prune -a
```

## 🔄 **Atualizações**

### **Atualizar Aplicação**
```bash
# Pull das últimas mudanças
git pull

# Rebuild e restart
docker-compose build backend
docker-compose up -d backend
```

### **Atualizar Dependências**
```bash
# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 **Suporte**

Para problemas relacionados ao Docker:
1. Verifique os logs: `docker-compose logs`
2. Consulte a documentação oficial do Docker
3. Verifique as issues do projeto no GitHub

**🏥 HospitAll - Sistema Profissional de Gestão Hospitalar**