const express = require("express");
const connectToMongoDB = require("./config/database");
const {User, ALLOWED_USER_FIELDS_FOR_UPDATE} = require("./models/user");
const {validateSignupData} = require("./utils/validations");
const {userAuth} = require("./middlewares/auth");


const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

app = express();

const JWT_SECRET_KEY = "devTinder_2%25";

// Middleware to parse JSON request bodies
app.use(express.json());

// This must be added then only cookies can be read from the API request
app.use(cookieParser());

// Signup route 
app.post("/signup", async (req, res)=> {
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
app.post("/login", async (req, res) => {

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
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        if (isPasswordMatch){
            const jwtToken = jwt.sign({userId: user._id}, JWT_SECRET_KEY, {expiresIn:"10h"});
            /**
                res.cookie("token", jwtToken, {
                    httpOnly: true,      // JS code cannot read the cookie value in browser -> It is a best practise 
                    secure: true,        // HTTPS only
                    sameSite: "Strict"   // Mitigate CSRF
                    maxAge: 10 * 60 * 60 * 1000 // cookie expires after 10 hours.
                });
            **/
            res.status(200).cookie("jwtToken", jwtToken, {httpOnly: true, maxAge:10 * 60 * 60 * 1000}).send({message:"Login successfull"});
        } else{
            res.status(401).send({message:"Invalid credentials"});
        }
    } catch (err){
        res.status(500).send({message:"Something went wrong" + err});
    }
});


// Get user by email route
app.get("/user", userAuth,  async (req, res, next)=>{
    try{
        const userEmail = req.body.email;
        const user = await User.find({email: userEmail});
        if (user.length === 0){
            return res.status(404).send({message: "User not found"});
        } else{
            res.status(200).send(user[0]);
        }
    } catch(err){
        res.status(500).send({message: "Error fetching user"});
    }
});

// Get user by email route
app.get("/users", userAuth, async (req, res, next)=>{
    try{
        const user = await User.find();
        if (user.length === 0){
            return res.status(404).send({message: "No users found"});
        } else{
            res.status(200).send(user);
        }
    } catch(err){
        res.status(500).send({message: "Error fetching user"});
    }
});

// Delete user by
app.delete("/user", userAuth, async (req, res)=>{
    try{
        const userId = req.body.userId;
        // findByIdAndDelete returns the delted document. If no document found, returns null
        const deltedUser = await User.findByIdAndDelete(userId);
        if (!deltedUser){
            return res.status(404).send({message: "No user found to delete"});
        } else{
            res.status(200).send({message: "User deleted successfully"});
        }  
    } catch(err){
        res.status(500).send({message: "Error deleting user"});
    }
}); 


// update any particular details of the user
// Using patch here as we are updating only few details, if we use PUT it set null to the fields not provided in the request body
app.patch("/user/:userId", userAuth, async (req, res)=> {
    try{
        const userID = req.params.userId;
        const updateRequest = req.body;
        // allow update only for the fields in ALLOWED_USER_FIELDS_FOR_UPDATE
        const requestFields = Object.keys(updateRequest);

        const inValidUpdateRequestFields = requestFields.filter((field) => !ALLOWED_USER_FIELDS_FOR_UPDATE.includes(field));
        if (inValidUpdateRequestFields.length > 0){
            throw new Error("Update action is restricted for: " + inValidUpdateRequestFields.join(", "));
        }

        const updatedUser = await User.findByIdAndUpdate(userID, updateRequest, {returnDocument:"after", runValidators:true}); // return the updated document
        if (updatedUser){
            res.status(200).send({message: "User details updated successfully"});
        } else{
            res.status(404).send({message: "No user found to update"});
        }
    } catch(err){
        res.status(500).send({message: "Error updating user -> " + err.message});
    }
});


// GET : Profile route

app.get("/profile", userAuth, async (req, res) => {
  try {
    
    // currentUser was appended in req by auth middleware
    const user = await User.findById(req.currentUser._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. The account may no longer exist."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
});



// Connection request route
app.post("/sendConnectionRequest", userAuth, async(req, res)=> {
    try{
        const userName = req.currentUser.firstName;
        res.send({message:`${userName} sent a connection request`});

    } catch(err){
        console.error(`sendConnectionRequest failed : ${err.message}`);
        res.status(500).message({message:"Something went wrong"});
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


