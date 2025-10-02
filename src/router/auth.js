const express = require("express");
const authRouter = express.Router();

const bcrypt = require("bcrypt");

const {validateSignupData} = require("../utils/validations");
const {User} = require("../models/user");


authRouter.post("/signup", async (req, res)=> {
    try{
        // validate the request body
        validateSignupData(req);

    
        const {firstName, lastName, email, password, age, photoUrl, gender, skills, about} = req.body;

        const isExistingUser = await User.findOne({email:email});
        if (isExistingUser){
            res.status(400).send({message:"User already exists"});
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName, 
            lastName, 
            email,  
            age, 
            photoUrl, 
            skills, 
            about, 
            gender, 
            password: passwordHash
        });

        await user.save();
        res.status(201).send({message: "User signed up successfully"});
    } catch(err){
        res.status(500).send({message: "Error signing up user -> " + err.message});
    }
});


// Login route
authRouter.post("/login", async (req, res) => {

    try{
        const {email, password} = req.body;

        if (!email || !password){
            res.status(400).send({message:"Bad request"});
        }

        // .select("+password") is need to here to fetch the password. As we restricted password in schema
        const user = await User.findOne({email:email}).select("+password"); 
        if (!user){
            res.status(401).send({message:"Invalid credentials"});
        }
        const isPasswordMatch = await user.isPasswordMatch(password);
        
        if (isPasswordMatch){
            const jwtToken = await user.getJWT();
            /**
                res.cookie("token", jwtToken, {
                    httpOnly: true,      // JS code cannot read the cookie value in browser -> It is a best practise 
                    secure: true,        // HTTPS only
                    sameSite: "Strict"   // Mitigate CSRF
                    maxAge: 10 * 60 * 60 * 1000 // cookie expires after 10 hours.
                });
            **/
            res.status(200)
                .cookie("jwtToken", jwtToken, {
                    httpOnly: true, 
                    maxAge:10 * 60 * 60 * 1000
                })
                .send({message:"Login successfull"});
        } else{
            res.status(401).send({message:"Invalid credentials"});
        }
    } catch (err){
        res.status(500).send({message:"Something went wrong " + err});
    }
});


// Logout Route

authRouter.post("/logout", (req, res) => {
    res.clearCookie("jwtToken", null, {httpOnly: true}); // clearCookie is a helper provided by express to clear the cookie.
    res.json({message:"Logout sucessfull"});
})


module.exports = authRouter;