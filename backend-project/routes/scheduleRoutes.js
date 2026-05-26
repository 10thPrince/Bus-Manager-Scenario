import express from "express";
import { protect, protectAdmin } from "../middleware/protectedRoutes.js";
import { createSchedule, deleteSchedule, getAllSchedules, updateSchedule } from "../controllers/scheduleControllers.js";

const router = express.Router();

router.post('/create', protectAdmin, createSchedule);
router.get('/getAll', protect, getAllSchedules);
router.put('/update/:id', protectAdmin, updateSchedule);
router.delete('/delete/:id', protectAdmin, deleteSchedule);

export default router