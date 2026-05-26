import db from "../config/db.js";
import bcrypt from 'bcryptjs';

export const register = (req, res) => {
    try {
        const { userName, password, role } = req.body;

        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Please Fill in all required fields!"
            })
        }

        // If not exist
        const q = "SELECT *  FROM yk_users WHERE UserName = ?";
        db.query(q, [userName], async (err, result) => {
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
                    message: "User Already Exist. Please LogIn Instead!"
                })
            }

            if (result.length === 0) {
                const hadhedPassword = await bcrypt.hash(password, 10);
                const q = "INSERT INTO yk_users(UserName, Password, UserRole) VALUE (?, ?, ?)";
                const mainRole = role ? role : "user"
                db.query(q, [userName, hadhedPassword, mainRole], (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            success: false,
                            message: "An error Occured",
                            Error: err
                        })
                    }
                    res.status(201).json({
                        success: true,
                        message: "User Registered Successfully! So Login to gain Access"
                    })
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "System Error!"
        })
    }
}

export const login = (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields!"
            })
        }

        const q = "SELECT * FROM yk_users WHERE UserName = ?";
        db.query(q, [userName], async (err, result) => {
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
                    message: "User Not Found. Please Register Instead!"
                })
            }
            if (result.length !== 0) {
                const match = await bcrypt.compare(password, result[0].Password);
                // console.log(result)
                if (!match) {
                    return res.status(400).json({
                        success: false,
                        message: "Brooooooo Pasuwadi siyo!"
                    })
                }
                
                if (result[0].UserRole == "user") {
                    req.session.user = {
                        userId: result[0].UserID,
                        userName: result[0].UserName,
                        role: result[0].UserRole
                    }
                    return res.status(200).json({
                        success: true,
                        message: "Login Successfull!",
                        user: req.session.user
                    })
                }

                req.session.admin = {
                    userId: result[0].UserID,
                    userName: result[0].UserName,
                    role: result[0].UserRole,
                    
                }
                res.status(200).json({
                    success: true,
                    message: "Login Successfull!",
                    user: req.session.admin
                })


            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "System Error!"
        })
    }
}

export const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Logout Failed!"
                })
                console.log(err)
            }
            res.status(200).json({
                success: true,
                message: "Logout Successfull!"
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