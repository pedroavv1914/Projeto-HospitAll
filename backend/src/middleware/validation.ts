import { body, param, query } from 'express-validator';

/**
 * Validações para autenticação
 */
export const authValidation = {
  // Validação para login
  login: [
    body('email')
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],

  // Validação para registro
  register: [
    body('name')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('email')
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .isLength({ min: 6, max: 100 })
      .withMessage('Senha deve ter entre 6 e 100 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    body('cpf')
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
    body('phone')
      .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('role')
      .optional()
      .isIn(['admin', 'doctor', 'patient'])
      .withMessage('Role deve ser: admin, doctor ou patient'),
  ],

  // Validação para refresh token
  refreshToken: [
    body('refresh_token')
      .notEmpty()
      .withMessage('Refresh token é obrigatório'),
  ],

  // Validação para alteração de senha
  changePassword: [
    body('current_password')
      .isLength({ min: 6 })
      .withMessage('Senha atual deve ter pelo menos 6 caracteres'),
    body('new_password')
      .isLength({ min: 6, max: 100 })
      .withMessage('Nova senha deve ter entre 6 e 100 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  ],
};

/**
 * Validações para usuários
 */
export const userValidation = {
  // Validação para criar usuário
  create: [
    body('name')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('email')
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .isLength({ min: 6, max: 100 })
      .withMessage('Senha deve ter entre 6 e 100 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    body('cpf')
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
    body('phone')
      .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('role')
      .isIn(['admin', 'doctor', 'patient'])
      .withMessage('Role deve ser: admin, doctor ou patient'),
  ],

  // Validação para atualizar usuário
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter um formato válido')
      .normalizeEmail()
      .toLowerCase(),
    body('cpf')
      .optional()
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
    body('phone')
      .optional()
      .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('role')
      .optional()
      .isIn(['admin', 'doctor', 'patient'])
      .withMessage('Role deve ser: admin, doctor ou patient'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active deve ser um valor booleano'),
  ],

  // Validação para buscar usuário por ID
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
  ],

  // Validação para listagem com paginação
  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit deve ser um número entre 1 e 100'),
    query('role')
      .optional()
      .isIn(['admin', 'doctor', 'patient'])
      .withMessage('Role deve ser: admin, doctor ou patient'),
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active deve ser um valor booleano'),
    query('search')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Busca deve ter entre 2 e 100 caracteres')
      .trim(),
  ],
};

/**
 * Validações para especialidades
 */
export const specialtyValidation = {
  create: [
    body('name')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres')
      .trim(),
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres')
      .trim(),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active deve ser um valor booleano'),
  ],

  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
  ],
};

/**
 * Validações para médicos
 */
export const doctorValidation = {
  create: [
    body('user_id')
      .isInt({ min: 1 })
      .withMessage('user_id deve ser um número inteiro positivo'),
    body('crm')
      .matches(/^CRM\/[A-Z]{2}\s\d{4,6}$/)
      .withMessage('CRM deve estar no formato CRM/UF XXXXXX'),
    body('specialty_id')
      .isInt({ min: 1 })
      .withMessage('specialty_id deve ser um número inteiro positivo'),
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('crm')
      .optional()
      .matches(/^CRM\/[A-Z]{2}\s\d{4,6}$/)
      .withMessage('CRM deve estar no formato CRM/UF XXXXXX'),
    body('specialty_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('specialty_id deve ser um número inteiro positivo'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active deve ser um valor booleano'),
  ],

  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
  ],
};

/**
 * Validações para pacientes
 */
export const patientValidation = {
  create: [
    body('user_id')
      .isInt({ min: 1 })
      .withMessage('user_id deve ser um número inteiro positivo'),
    body('birth_date')
      .isISO8601()
      .withMessage('Data de nascimento deve estar no formato ISO 8601 (YYYY-MM-DD)')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0 || age > 150) {
          throw new Error('Data de nascimento inválida');
        }
        return true;
      }),
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    body('emergency_contact')
      .optional()
      .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .withMessage('Contato de emergência deve estar no formato (XX) XXXXX-XXXX'),
    body('blood_type')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Tipo sanguíneo deve ser: A+, A-, B+, B-, AB+, AB-, O+ ou O-'),
    body('allergies')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Alergias deve ter no máximo 1000 caracteres')
      .trim(),
    body('medical_history')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Histórico médico deve ter no máximo 2000 caracteres')
      .trim(),
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('birth_date')
      .optional()
      .isISO8601()
      .withMessage('Data de nascimento deve estar no formato ISO 8601 (YYYY-MM-DD)')
      .custom((value) => {
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 0 || age > 150) {
            throw new Error('Data de nascimento inválida');
          }
        }
        return true;
      }),
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Endereço deve ter no máximo 500 caracteres')
      .trim(),
    body('emergency_contact')
      .optional()
      .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .withMessage('Contato de emergência deve estar no formato (XX) XXXXX-XXXX'),
    body('blood_type')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Tipo sanguíneo deve ser: A+, A-, B+, B-, AB+, AB-, O+ ou O-'),
    body('allergies')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Alergias deve ter no máximo 1000 caracteres')
      .trim(),
    body('medical_history')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Histórico médico deve ter no máximo 2000 caracteres')
      .trim(),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active deve ser um valor booleano'),
  ],

  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
  ],
};

/**
 * Validações para agendamentos
 */
export const appointmentValidation = {
  create: [
    body('doctor_id')
      .isInt({ min: 1 })
      .withMessage('doctor_id deve ser um número inteiro positivo'),
    body('patient_id')
      .isInt({ min: 1 })
      .withMessage('patient_id deve ser um número inteiro positivo'),
    body('appointment_date')
      .isISO8601()
      .withMessage('Data do agendamento deve estar no formato ISO 8601')
      .custom((value) => {
        const appointmentDate = new Date(value);
        const now = new Date();
        if (appointmentDate <= now) {
          throw new Error('Data do agendamento deve ser no futuro');
        }
        return true;
      }),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
      .trim(),
    body('duration_minutes')
      .optional()
      .isInt({ min: 15, max: 240 })
      .withMessage('Duração deve ser entre 15 e 240 minutos'),
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
    body('appointment_date')
      .optional()
      .isISO8601()
      .withMessage('Data do agendamento deve estar no formato ISO 8601'),
    body('status')
      .optional()
      .isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
      .withMessage('Status deve ser: scheduled, confirmed, in_progress, completed, cancelled ou no_show'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Observações devem ter no máximo 1000 caracteres')
      .trim(),
    body('duration_minutes')
      .optional()
      .isInt({ min: 15, max: 240 })
      .withMessage('Duração deve ser entre 15 e 240 minutos'),
  ],

  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo'),
  ],

  getByDateRange: [
    query('start_date')
      .isISO8601()
      .withMessage('Data inicial deve estar no formato ISO 8601'),
    query('end_date')
      .isISO8601()
      .withMessage('Data final deve estar no formato ISO 8601'),
    query('doctor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('doctor_id deve ser um número inteiro positivo'),
    query('patient_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('patient_id deve ser um número inteiro positivo'),
  ],
};