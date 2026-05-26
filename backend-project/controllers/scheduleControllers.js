import db from "../config/db.js";

export const createSchedule = (req, res) => {
    try {
        const { routeName, departurePoint, destination, departureTime, estimatedArrivalTime, ticketPrice,  scheduleStatus, busId } = req.body;

        if (!routeName || !departurePoint || !destination || !departureTime || !estimatedArrivalTime || !ticketPrice || !scheduleStatus || !busId) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_buses WHERE BusID = ?";
        db.query(q, [busId], (err, result) => {
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
                    message: "The selected Bus Id is Invalid."
                })
            }
            const q = "INSERT INTO yk_schedules(BusID, RouteName, DeparturePoint, Destination, DepartureTime, EstimatedArrivalTime,  TicketPrice, ScheduleStatus) VALUE(?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(q, [ busId, routeName, departurePoint, destination, departureTime, estimatedArrivalTime, ticketPrice, scheduleStatus], (err, result) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "An error Occured",
                        Error: err
                    })
                }
                res.status(201).json({
                    success: true,
                    message: "Schedule Created Successfully!"
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


export const getAllSchedules = (req, res) => {
    try {
        const q = "SELECT * FROM yk_schedules";
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
                    message: "The Schedule Database is Empty!"
                })
            }
            res.status(200).json({
                success: true,
                message: "Schedules retrieved successfully!",
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


export const updateSchedule = (req, res) => {
    try {
        const { id } = req.params;
        const { routeName, departurePoint, destination, departureTime, estimatedArrivalTime, ticketPrice,  scheduleStatus, busId } = req.body;

        if (!routeName || !departurePoint || !destination || !departureTime || !estimatedArrivalTime || !ticketPrice || !scheduleStatus || !busId) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_schedules WHERE ScheduleID = ?";
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
                    message: "Invalid Schedule Id. Schedule Not Found!"
                })
            }
            const q = "SELECT * FROM yk_buses WHERE BusID = ?";
            db.query(q, [busId], (err, result) => {
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
                        message: "The selected Bus Is Not found. Invalid Bus Id!"
                    })
                }
                const q = "UPDATE yk_schedules SET BusID = ?, RouteName = ?, DeparturePoint = ?, Destination = ?, DepartureTime = ?, EstimatedArrivalTime = ?,  TicketPrice = ?, ScheduleStatus = ?  WHERE ScheduleID = ?";
                db.query(q, [busId, routeName, departurePoint, destination, departureTime, estimatedArrivalTime, ticketPrice, scheduleStatus, id], (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            success: false,
                            message: "An error Occured",
                            Error: err
                        })
                    }
                    res.status(200).json({
                        success: true,
                        message: "Schedule Updated Successfully!"
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


export const deleteSchedule = (req, res) => {
    try {
        const { id } = req.params

        const q = "SELECT * FROM yk_schedules WHERE ScheduleID = ?"
        db.query(q, [id], (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }
            if(result.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Schedule Not Found. Invalid Schedule Id!"
                })
            }
            const q = "DELETE FROM yk_schedules WHERE ScheduleID = ?";
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
                    message: "Schedule Deleted Successfully!"
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
