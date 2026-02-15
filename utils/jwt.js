import jwt from "jsonwebtoken"


const SECRET = process.env.JWT_SECRET || "supersecretkey";
const EXPIRES_IN = "7d";

export function signToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        SECRET,
        {
            expiresIn: EXPIRES_IN
        }
        
    )
}

export function verifyToken(token){
    return jwt.verify(token,SECRET);
}