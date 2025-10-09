-- Script de inicialização do banco de dados HospitAll
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Criar usuário adicional para aplicação (se necessário)
-- CREATE USER hospitall_app WITH PASSWORD 'app_password';
-- GRANT CONNECT ON DATABASE hospitall_db TO hospitall_app;

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Comentários informativos
COMMENT ON DATABASE hospitall_db IS 'Banco de dados do sistema HospitAll - Gestão Hospitalar';

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'HospitAll Database initialized successfully at %', NOW();
END $$;