import express from 'express'
import { login, logout, register } from '../controllers/authControllers.js';
import { protect, protectAdmin } from '../middleware/protectedRoutes.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);

export default router