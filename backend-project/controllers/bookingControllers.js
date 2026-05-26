import db from "../config/db.js";

export const createBooking = (req, res) => {
    try {
        const { passengerName, passengerGender, passengerPhone, seatNumber, paymentStatus, bookingDate, scheduleId } = req.body;

        if (!passengerName || !passengerGender || !passengerPhone || !seatNumber || !paymentStatus || !bookingDate || !scheduleId) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_schedules WHERE ScheduleID = ?";
        db.query(q, [scheduleId], (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }
            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "The selected Schedule Id is Invalid."
                })
            }
            const userId = req.session.user?.userId || req.session.admin?.userId
            const q = "INSERT INTO yk_bookings(ScheduleID, UserID, PassengerName, PassengerGender, PassengerPhone, SeatNumber, PaymentStatus,  BookingDate) VALUE(?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(q, [scheduleId, userId, passengerName, passengerGender, passengerPhone, seatNumber, paymentStatus, bookingDate], (err, result) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "An error Occured",
                        Error: err
                    })
                }
                res.status(201).json({
                    success: true,
                    message: "Booking Created Successfully!"
                })
            })

        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "System Error!"
        })
    }
}


export const getAllBookings = (req, res) => {
    try {
        const q = "SELECT * FROM yk_bookings";
        console.log(req)
        db.query(q, (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }


            if (result.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "The Booking Database is Empty!"
                })
            }
            res.status(200).json({
                success: true,
                message: "Bookings retrieved successfully!",
                data: result
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "System Error!"
        })
    }
}


export const updateBooking = (req, res) => {
    try {
        const { id } = req.params;
        const { passengerName, passengerGender, passengerPhone, seatNumber, paymentStatus, bookingDate, scheduleId } = req.body;

        if (!passengerName || !passengerGender || !passengerPhone || !seatNumber || !paymentStatus || !bookingDate || !scheduleId) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_bookings WHERE BookingID = ?";
        db.query(q, [id], (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }
            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid Booking Id. Booking Not Found!"
                })
            }
            const q = "SELECT * FROM yk_schedules WHERE ScheduleID = ?";
            db.query(q, [scheduleId], (err, result) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "An error Occured",
                        Error: err
                    })
                }
                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "The selected Schedule Is Not found. Invalid Schedule Id!"
                    })
                }
                const userId = req.session.user?.userId || req.session.admin?.userId
                const q = "UPDATE yk_bookings SET ScheduleID = ?, UserID = ?, PassengerName = ?, PassengerGender = ?, PassengerPhone = ?, SeatNumber = ?, PaymentStatus = ?,  BookingDate = ?  WHERE BookingID = ?";
                db.query(q, [scheduleId, userId, passengerName, passengerGender, passengerPhone, seatNumber, paymentStatus, bookingDate, id], (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            success: false,
                            message: "An error Occured",
                            Error: err
                        })
                    }
                    res.status(200).json({
                        success: true,
                        message: "Booking Updated Successfully!"
                    })
                })

            })
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "System Error!"
        })
    }
}


export const deleteBooking = (req, res) => {
    try {
        const { id } = req.params

        const q = "SELECT * FROM yk_bookings WHERE BookingID = ?"
        db.query(q, [id], (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }
            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Booking Not Found. Invalid Booking Id!"
                })
            }
            const q = "DELETE FROM yk_bookings WHERE BookingID = ?";
            db.query(q, [id], (err, result) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "An error Occured",
                        Error: err
                    })
                }
                res.status(200).json({
                    success: true,
                    message: "Booking Deleted Successfully!"
                })
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "System Error!"
        })
    }
}
