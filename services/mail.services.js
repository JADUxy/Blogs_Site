import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

const APP_KEY = process.env.GAMIL_APP_KEY;
const EMAIL = process.env.EMAIL_USER;
console.log(APP_KEY)
console.log(EMAIL)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: APP_KEY,
    },
});

transporter.verify().then(() => { console.log("mail transproter verified") }).catch(() => { console.log("mail transporter failed") })

async function sendMail({to, subject, text, html}) {

    const info = await transporter.sendMail({
        from: 'rohitrameshwarsawant@gmail.com',
        to: to,
        subject: subject,
        text: text, // Plain-text version of the message
        html: html, // HTML version of the message


    })
    return info;
}

/*
  OTP specific helper
*/
export async function sendOTP(email, otp) {
    return sendMail({
        to: email,
        subject: "Email Verification OTP",
        text: `Your OTP is ${otp}. Valid for 5 minutes.`,
        html: `
      <div style="font-family:sans-serif">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>Expires in 5 minutes</p>
      </div>
    `,
    });
}


