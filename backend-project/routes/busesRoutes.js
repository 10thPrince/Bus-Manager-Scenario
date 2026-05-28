import express from 'express';
import { protectAdmin } from '../middleware/protectedRoutes.js';
import { createBus, deleteBus, getAllBuses, updateBus } from '../controllers/busesControllers.js';

const router = express.Router();

router.post('/create', protectAdmin, createBus);
router.get('/getAll', protectAdmin, getAllBuses);
router.put('/update/:id', protectAdmin, updateBus);
router.delete('/delete/:id', protectAdmin, deleteBus);

export default router
