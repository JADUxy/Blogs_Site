import dotenv from "dotenv"
dotenv.config();
import express from "express";
import router from "./routes/index.route.js"
import path from "path"
import seedDatabase from "./seed.js";
import db from "./db.js";
// seedDatabase();

let app = express();
const PORT = process.env.PORT || 3000;
const __dirname = import.meta.dirname;

console.log(db.prepare("SELECT * FROM users").all());



app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname,"public")));

// --------routes
// ---------------

app.use("/api",router)

// error 404 ---------------
// error 404 ---------------

app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: "router not found"
    })
})



app.listen(PORT,()=>{
    console.log("server launced on localhost:3000");
})
