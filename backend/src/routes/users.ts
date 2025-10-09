import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { userValidation } from '../middleware/validation';
import { 
  authenticateToken, 
  requireAdmin, 
  requireOwnerOrAdmin,
  checkTokenExpiry 
} from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para gerenciamento de usuários
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Listar usuários com paginação e filtros
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, doctor, patient]
 *         description: Filtrar por role
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Buscar por nome, email ou CPF
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *                     has_next:
 *                       type: boolean
 *                     has_prev:
 *                       type: boolean
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', 
  authenticateToken, 
  requireAdmin, 
  userValidation.list, 
  UserController.list
);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Obter perfil do usuário logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/profile', 
  authenticateToken, 
  checkTokenExpiry, 
  UserController.getProfile
);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Atualizar perfil do usuário logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "João Silva Santos"
 *               phone:
 *                 type: string
 *                 pattern: "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$"
 *                 example: "(11) 99999-9999"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/profile', 
  authenticateToken, 
  UserController.updateProfile
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', 
  authenticateToken, 
  requireOwnerOrAdmin(), 
  userValidation.getById, 
  UserController.getById
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Criar novo usuário (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Dr. Maria Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria@hospitall.com"
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
 *                 example: "doctor"
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
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Email ou CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  userValidation.create, 
  UserController.create
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               cpf:
 *                 type: string
 *                 pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$"
 *               phone:
 *                 type: string
 *                 pattern: "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$"
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, patient]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Email ou CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  userValidation.update, 
  UserController.update
);

/**
 * @swagger
 * /api/v1/users/{id}/deactivate:
 *   patch:
 *     summary: Desativar usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário desativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/deactivate', 
  authenticateToken, 
  requireAdmin, 
  UserController.deactivate
);

/**
 * @swagger
 * /api/v1/users/{id}/activate:
 *   patch:
 *     summary: Reativar usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário reativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/activate', 
  authenticateToken, 
  requireAdmin, 
  UserController.activate
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Deletar usuário permanentemente (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado permanentemente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Usuário possui registros associados
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  UserController.delete
);

export default router;