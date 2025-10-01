import { Router } from 'express';
import { login, register } from '../controllers/authController.js';

const router = Router();

// Login route
router.post('/login', login);

// Register route (for initial admin setup - remove in production)
router.post('/register', register);

export default router;
