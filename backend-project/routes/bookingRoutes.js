import express from "express";
import { protect } from "../middleware/protectedRoutes.js";
import { createBooking, deleteBooking, getAllBookings, getBookedSeats, updateBooking } from "../controllers/bookingControllers.js";

const router = express.Router();

router.post('/create', protect, createBooking);
router.get('/getAll', protect, getAllBookings);
router.get('/bookedSeats/:scheduleId', protect, getBookedSeats);
router.put('/update/:id', protect, updateBooking);
router.delete('/delete/:id', protect, deleteBooking);

export default router
