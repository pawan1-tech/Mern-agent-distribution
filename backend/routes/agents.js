import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { 
  listAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent, 
  getAgentById 
} from '../controllers/agentController.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

// Validation rules
const agentValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('countryCode')
    .notEmpty()
    .withMessage('Country code is required')
    .matches(/^\+[1-9]\d{1,3}$/)
    .withMessage('Country code must start with + and be 2-4 digits'),
  body('mobile')
    .isLength({ min: 7, max: 15 })
    .withMessage('Mobile number must be between 7 and 15 digits')
    .matches(/^\d+$/)
    .withMessage('Mobile number must contain only digits'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Routes
router.get('/', listAgents);
router.get('/:id', getAgentById);
router.post('/', agentValidation, createAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

export default router;
