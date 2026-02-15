import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(400).send("no header found");
    }

    try {
        const token = auth.split(" ")[1];

        const user = verifyToken(token)

        if (Date.now() > user.otp_expiry) {
            return res.status(400).json({ status: false, message: "OTP expired" });
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({
            message: "invalid token"
        })
    }
}