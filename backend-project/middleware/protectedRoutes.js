export const protect = (req, res, next) => {
    if (req.session.user || req.session.admin) {
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: "Unathorized. Please login To get Access!"
        })
    }
}

export const protectAdmin = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: "Admin Only!. Please login To get Access!"
        })
    }
}