import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  resetUserPassword
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff'])
    .withMessage('Role must be admin, manager, or staff')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/login', loginValidation, login);

// Protected routes
router.post('/register', authenticateToken, requireRole(['admin']), registerValidation, register);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);

// Admin-only user management routes
router.get('/users', authenticateToken, requireRole(['admin']), getAllUsers);
router.get('/users/:id', authenticateToken, requireRole(['admin']), getUserById);
router.put('/users/:id', authenticateToken, requireRole(['admin']), updateProfileValidation, updateUser);
router.patch('/users/:id/deactivate', authenticateToken, requireRole(['admin']), deactivateUser);
router.patch('/users/:id/reset-password', authenticateToken, requireRole(['admin']), resetUserPassword);

export default router;