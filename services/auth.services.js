import db from "../db.js";
import bcrypt from "bcrypt"
import { generateOTP, otpExpiry } from "../utils/otp.js";
import { sendOTP } from "./mail.services.js";

const SALT_ROUND = 10;


export function registerUser(userName, password, email, otp) {
    const hash = bcrypt.hashSync(password, SALT_ROUND);
    const qury = db.prepare(`
        INSERT INTO users (username, password_hash, email, otp, otp_expiry)
        VALUES (?, ?,?,?,?)
    `);

    const exp = otpExpiry();

    const result = qury.run(userName, hash, email, otp, exp);

    console.log("user adding to database ");

    return {
        status: true,
        result
    };
}
export function saveUser(email) {
    const query = db.prepare(`
        UPDATE users
        SET is_verified=1, otp=NULL, otp_expiry=NULL
        WHERE email=?
    `)
    return query.run(email);
}

export function findUserByUsername(username) {
    const user = db.prepare(`
    SELECT * FROM users WHERE username = ?
  `).get(username);
    return user
}
export function findUserByEmail(email) {
    const user = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email);
    return user

}

export function verifyUser(username, password) {
    let user = findUserByUsername(username);

    if (!user) {
        user = findUserByEmail(username);
        if (!user) {
            return null;
        };
    };

    const match = bcrypt.compareSync(password, user.password_hash);

    if (!match) return null;

    return user;
}

