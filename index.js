import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import authRouter from "./routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//routes
app.get('/', (req,res)=>{
    res.send("welcome to carRent");
})
app.use(authRouter);

//starting server
const port = '3000';
const connection ='mongodb://localhost:27017/carRent';
mongoose.connect(connection)
.then(() => app.listen(port))
  .then(console.log(`server start on port ${port}`))
  .catch((err) => console.log(err));