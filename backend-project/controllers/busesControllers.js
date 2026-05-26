import db from "../config/db.js";

export const createBus = (req, res) => {
    try {
        const { plateNumber, totalSeats, busType } = req.body;

        if (!plateNumber || !totalSeats || !busType) {
            return res.status(400).json({
                success: true,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_buses WHERE PlateNumber = ?";
        db.query(q, [plateNumber], (err, result) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "An error Occured",
                    Error: err
                })
            }
            if (result.length !== 0) {
                return res.status(400).json({
                    success: false,
                    message: "Bus Already Exist!"
                })
            }

            const q = "INSERT INTO yk_buses(PlateNumber, TotalSeats, BusType) VALUES (?, ?, ?)";
            db.query(q, [plateNumber, totalSeats, busType], (err, result) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "An error Occured",
                        Error: err
                    })
                }
                res.status(201).json({
                    success: true,
                    message: "A New Bus was Added Successful"
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


export const getAllBuses = (req, res) => {
    try {
        const q = "SELECT * FROM yk_buses";
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
                    message: "The is no Bus in the database!"
                })
            }
            res.status(200).json({
                success: true,
                message: "Buses Retrived successfull",
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


export const updateBus = (req, res) => {
    try {
        const { id } = req.params;
        const { plateNumber, totalSeats, busType } = req.body;

        if (!plateNumber || !totalSeats || !busType) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_buses WHERE BusID = ?";
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
                    message: "Bus not found. Invalid Id!"
                })
            }
            const q = "UPDATE yk_buses SET PlateNumber = ?, TotalSeats = ?, BusType = ? WHERE BusID = ?";
            db.query(q, [plateNumber, totalSeats, busType, id], (err, result) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "An error Occured",
                        Error: err
                    })
                }
                res.status(200).json({
                    success: true,
                    message: "Bus Updated Successful"
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


export const deleteBus = (req, res) => {
    try {
        const { id } = req.params;

        const q = "SELECT * FROM yk_buses WHERE BusID = ?";
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
                    message: "Bus Not found. Invalid Id!"
                })
            }
            const q = "DELETE FROM yk_buses WHERE BusID = ?";
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
                    message: "Bus Delete Successfully!"
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