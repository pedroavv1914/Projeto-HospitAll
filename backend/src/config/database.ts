import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Use SQLite for development if PostgreSQL is not available
const isDevelopment = process.env.NODE_ENV === 'development';
const usePostgres = process.env.USE_POSTGRES === 'true';

let sequelize: Sequelize;

if (isDevelopment && !usePostgres) {
  // SQLite configuration for development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  });
} else {
  // PostgreSQL configuration for production or when explicitly enabled
  sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hospitall_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  });
}

export { sequelize };