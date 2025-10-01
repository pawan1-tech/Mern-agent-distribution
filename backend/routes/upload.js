import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { 
  uploadAndDistribute, 
  listDistributions, 
  getDistribution 
} from '../controllers/uploadController.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

// Routes
router.post('/csv', upload.single('file'), uploadAndDistribute);
router.get('/distributions', listDistributions);
router.get('/distributions/:id', getDistribution);

export default router;
