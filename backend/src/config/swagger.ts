import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HospitAll API',
      version: '1.0.0',
      description: 'Sistema de Gestão Hospitalar - API para gerenciar pacientes, médicos e agendamentos',
      contact: {
        name: 'Equipe HospitAll',
        email: 'contato@hospitall.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://hospitall-api.herokuapp.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Servidor de Produção' : 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação. Formato: Bearer {token}',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
            message: {
              type: 'string',
              description: 'Detalhes do erro',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário',
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
            },
            cpf: {
              type: 'string',
              description: 'CPF do usuário',
            },
            phone: {
              type: 'string',
              description: 'Telefone do usuário',
            },
            role: {
              type: 'string',
              enum: ['admin', 'doctor', 'patient'],
              description: 'Tipo de usuário',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do médico',
            },
            user_id: {
              type: 'integer',
              description: 'ID do usuário associado',
            },
            crm: {
              type: 'string',
              description: 'Número do CRM',
            },
            specialty_id: {
              type: 'integer',
              description: 'ID da especialidade',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do paciente',
            },
            user_id: {
              type: 'integer',
              description: 'ID do usuário associado',
            },
            birth_date: {
              type: 'string',
              format: 'date',
              description: 'Data de nascimento',
            },
            address: {
              type: 'string',
              description: 'Endereço completo',
            },
            emergency_contact: {
              type: 'string',
              description: 'Contato de emergência',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Specialty: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da especialidade',
            },
            name: {
              type: 'string',
              description: 'Nome da especialidade',
            },
            description: {
              type: 'string',
              description: 'Descrição da especialidade',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da consulta',
            },
            doctor_id: {
              type: 'integer',
              description: 'ID do médico',
            },
            patient_id: {
              type: 'integer',
              description: 'ID do paciente',
            },
            appointment_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da consulta',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled'],
              description: 'Status da consulta',
            },
            notes: {
              type: 'string',
              description: 'Observações da consulta',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do prontuário',
            },
            patient_id: {
              type: 'integer',
              description: 'ID do paciente',
            },
            doctor_id: {
              type: 'integer',
              description: 'ID do médico',
            },
            appointment_id: {
              type: 'integer',
              description: 'ID da consulta',
            },
            diagnosis: {
              type: 'string',
              description: 'Diagnóstico',
            },
            treatment: {
              type: 'string',
              description: 'Tratamento prescrito',
            },
            medications: {
              type: 'string',
              description: 'Medicamentos prescritos',
            },
            observations: {
              type: 'string',
              description: 'Observações médicas',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};