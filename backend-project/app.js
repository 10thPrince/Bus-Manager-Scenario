import express from "express";
import dotenv from 'dotenv';
import colors from '@colors/colors';
import db from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busesRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js'
import session from "express-session";
import cors from 'cors'

dotenv.config(); 
 
const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "App running successfully"
    })
})
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: 'Content-Type'
}))

app.use(session({
    name: "userId",
    secret: 'Princesecretkey09876',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}))

app.use('/auth', authRoutes);
app.use('/bus', busRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/booking', bookingRoutes);

app.listen(port, () => {
    console.log(colors.bgBlue(`App running on port ${port}`))
})
