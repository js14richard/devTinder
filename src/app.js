const express = require("express");
const connectToMongoDB = require("./config/database");

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

const authRouter = require("./router/auth");
const profileRouter = require("./router/profile");
const connectionRouter = require("./router/connection");
const userRouter = require("./router/user");

// Middleware to parse JSON request bodies
app.use(express.json());

// This must be added then only cookies can be read from the API request
app.use(cookieParser());


// Router setup 

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRouter);
app.use("/", userRouter);



connectToMongoDB()
    .then(()=>{
        console.log("Connected to MongoDB");
        app.listen(5000, ()=>{
            console.log("Server started on port 5000");
        });
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB", err.message);
    }); 


