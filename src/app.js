const express = require("express");
const connectToMongoDB = require("./config/database");
const User = require("./models/user");

app = express();


app.post("/signup", async (req, res)=> {

    try{
        const newUser = {
            firstName: "Siril",
            lastName: "Richard", 
            email:"siril@gmail.com", 
            password: "mypassword",
        };
        const user = new User(newUser);
        await user.save();
        res.status(201).send({message: "User signed up successfully"});
    } catch(err){
        res.status(500).send({message: "Error signing up user"});
    }
});




connectToMongoDB()
    .then(()=>{
        console.log("Connected to MongoDB");
        app.listen(5000, ()=>{
            console.log("Server started on port 5000");
        });
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB", err);
    }); 


