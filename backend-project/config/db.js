import mysql from 'mysql2';
import colors from '@colors/colors';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})


db.connect((err) => {
    if (err) {
        return console.log(colors.red(`Connecting to db Failed: ${err}`))
    }
    console.log(colors.green('DB Connected Successfully!'))

})

export default db;