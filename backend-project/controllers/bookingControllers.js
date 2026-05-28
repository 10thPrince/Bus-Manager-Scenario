import db from "../config/db.js";

const getCurrentUserId = (req) => req.session.user?.userId || req.session.admin?.userId

const isNormalUser = (req) => Boolean(req.session.user)

const getScheduleAvailability = (scheduleId, seatNumber, ignoredBookingId, callback) => {
    const ignoredBookingFilter = ignoredBookingId ? "AND BookingID != ?" : "";
    const params = ignoredBookingId ? [ignoredBookingId, seatNumber, ignoredBookingId, scheduleId] : [seatNumber, scheduleId];
    const q = `
        SELECT
            s.*,
            b.TotalSeats,
            (s.DepartureTime <= CURTIME()) AS HasDeparted,
            (
                SELECT COUNT(*)
                FROM yk_bookings
                WHERE ScheduleID = s.ScheduleID
                AND LOWER(COALESCE(PaymentStatus, '')) != 'cancelled'
                ${ignoredBookingFilter}
            ) AS BookedSeats,
            (
                SELECT COUNT(*)
                FROM yk_bookings
                WHERE ScheduleID = s.ScheduleID
                AND SeatNumber = ?
                AND LOWER(COALESCE(PaymentStatus, '')) != 'cancelled'
                ${ignoredBookingFilter}
            ) AS SeatTaken
        FROM yk_schedules s
        INNER JOIN yk_buses b ON b.BusID = s.BusID
        WHERE s.ScheduleID = ?
    `;

    db.query(q, params, callback)
}

const validateBookableSchedule = (schedule, seatNumber) => {
    const totalSeats = Number(schedule.TotalSeats || 0)
    const bookedSeats = Number(schedule.BookedSeats || 0)
    const normalizedStatus = String(schedule.ScheduleStatus || '').toLowerCase()

    if (normalizedStatus !== 'active') {
        return "This schedule is not available for booking."
    }

    if (Number(schedule.HasDeparted) === 1) {
        return "This schedule is no longer available because the departure time has passed."
    }

    if (Number(seatNumber) < 1 || Number(seatNumber) > totalSeats) {
        return "The selected seat is not valid for this schedule."
    }

    if (bookedSeats >= totalSeats) {
        return "This schedule is fully booked."
    }

    if (Number(schedule.SeatTaken) > 0) {
        return "This seat is already booked."
    }

    return null
}

export const createBooking = (req, res) => {
    try {
        const { passengerName, passengerGender, passengerPhone, seatNumber, paymentStatus, bookingDate, scheduleId } = req.body;

        if (!passengerName || !passengerGender || !passengerPhone || !seatNumber || !paymentStatus || !bookingDate || !scheduleId) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        getScheduleAvailability(scheduleId, seatNumber, null, (err, result) => {
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
            const availabilityError = validateBookableSchedule(result[0], seatNumber)
            if (availabilityError) {
                return res.status(400).json({
                    success: false,
                    message: availabilityError
                })
            }

            const userId = getCurrentUserId(req)
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
        const params = []
        let q = `
            SELECT
                bk.*,
                s.RouteName,
                s.DeparturePoint,
                s.Destination,
                s.DepartureTime,
                s.EstimatedArrivalTime,
                s.TicketPrice,
                s.ScheduleStatus
            FROM yk_bookings bk
            LEFT JOIN yk_schedules s ON s.ScheduleID = bk.ScheduleID
        `;

        if (isNormalUser(req)) {
            q += " WHERE bk.UserID = ?"
            params.push(req.session.user.userId)
        }

        q += " ORDER BY bk.BookingID DESC"

        db.query(q, params, (err, result) => {
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

export const getBookedSeats = (req, res) => {
    try {
        const { scheduleId } = req.params
        const q = `
            SELECT BookingID, SeatNumber
            FROM yk_bookings
            WHERE ScheduleID = ?
            AND LOWER(COALESCE(PaymentStatus, '')) != 'cancelled'
        `;

        db.query(q, [scheduleId], (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }

            res.status(200).json({
                success: true,
                message: "Booked seats retrieved successfully!",
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
            const existingBooking = result[0]
            if (isNormalUser(req) && Number(existingBooking.UserID) !== Number(req.session.user.userId)) {
                return res.status(403).json({
                    success: false,
                    message: "You can only update your own bookings."
                })
            }

            getScheduleAvailability(scheduleId, seatNumber, id, (err, result) => {
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
                const availabilityError = validateBookableSchedule(result[0], seatNumber)
                if (availabilityError) {
                    return res.status(400).json({
                        success: false,
                        message: availabilityError
                    })
                }

                const userId = req.session.user?.userId || existingBooking.UserID || req.session.admin?.userId
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
            if (isNormalUser(req) && Number(result[0].UserID) !== Number(req.session.user.userId)) {
                return res.status(403).json({
                    success: false,
                    message: "You can only delete your own bookings."
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
