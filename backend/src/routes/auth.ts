import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authValidation } from '../middleware/validation';
import { authenticateToken, checkTokenExpiry } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints para autenticação de usuários
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "doctor@hospitall.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: string
 *                       example: "7d"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', authValidation.login, AuthController.login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro de novo usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - cpf
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
 *                 example: "MinhaSenh@123"
 *               cpf:
 *                 type: string
 *                 pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$"
 *                 example: "123.456.789-00"
 *               phone:
 *                 type: string
 *                 pattern: "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$"
 *                 example: "(11) 99999-9999"
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, patient]
 *                 default: patient
 *                 example: "patient"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     token_type:
 *                       type: string
 *                     expires_in:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/register', authValidation.register, AuthController.register);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     token_type:
 *                       type: string
 *                     expires_in:
 *                       type: string
 *       400:
 *         description: Refresh token requerido
 *       401:
 *         description: Refresh token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/refresh', authValidation.refreshToken, AuthController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 note:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     summary: Verificar se o token é válido
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token_info:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     iat:
 *                       type: number
 *                     exp:
 *                       type: number
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/verify', authenticateToken, checkTokenExpiry, AuthController.verifyToken);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Alterar senha do usuário
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 minLength: 6
 *                 example: "senhaAtual123"
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
 *                 example: "NovaSenha@456"
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/change-password', 
  authenticateToken, 
  authValidation.changePassword, 
  AuthController.changePassword
);

export default router;