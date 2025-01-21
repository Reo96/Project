import express from "express";
import userRouter from  './routes/user.routes.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import connectToDB from './config/db.js'
import driveRoutes from "./routes/drive.routes.js";
import middleware from './middlewares/auth.js'

dotenv.config();
const app = express();
import session from "express-session";

app.use(
  session({
    secret: process.env.SECRET_KEY, // Replace with a secure, random string
    resave: false, // Don't save session if it hasn't been modified
    saveUninitialized: false, // Don't create session until data is added
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session expiry time (e.g., 1 day)
      httpOnly: true, // Prevents client-side JS from accessing cookies
      secure: false, // Set to true if using HTTPS
    },
  })
);


app.set("view engine","ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));
const PORT = 3000;

app.use('/user',userRouter);
app.use('/drive' ,middleware, driveRoutes);

app.listen(PORT, ()=>{
    connectToDB();
    console.log('server running on http://localhost:'+PORT);
})