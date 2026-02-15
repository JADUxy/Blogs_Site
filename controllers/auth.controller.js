import { findUserByEmail, registerUser, saveUser, verifyUser } from "../services/auth.services.js";
import { sendOTP } from "../services/mail.services.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { generateOTP } from "../utils/otp.js";



export async function register(req, res) {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ success: false, message: "Missing Field" });
    }

    const existing = findUserByEmail(email);
    if (existing) {
        return res.status(400).json({ status: false, message: "Email already registered" });
    }


    const otp = generateOTP();

    registerUser(username, password, email, otp);

    try {
        await sendOTP(email, otp);
        res.json({
            status: true,
            message: "otp sent to mail"
        })
    } catch (error) {
        res.json({
            status: false,
            message: "error in sending otp "
        })
    }


}

export function verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ status: false, message: "Missing field" })
    }

    const user = findUserByEmail(email);

    if (!user) {
        return res.status(400).json({ status: false, message: "user not found" });
    }
    if (Date.now() > user.otp_expiry) {
        return res.status(400).json({ status: false, message: "OTP expired" });
    }
    if (user.otp != otp) {
        return res.status(400).json({ status: false, message: "invalid otp" });
    }

    saveUser(email);
    res.json({ status: true, token: signToken(user), message: "user verified, created new entry in database" });

}

export function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing Field" });
    }
    const user = verifyUser(username, password);
    if (!user) {
        return res.json({
            status: false,
            message: "no user found"
        })
    }
    const token = signToken(user);
    res.json({
        status: true,
        token
    })
}


