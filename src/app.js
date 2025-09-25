const express = require("express");
const connectToMongoDB = require("./config/database");
const User = require("./models/user");

app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Signup route 
app.post("/signup", async (req, res)=> {
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send({message: "User signed up successfully"});
    } catch(err){
        res.status(500).send({message: "Error signing up user"});
    }
});


// Get user by email route
app.get("/user", async (req, res)=>{
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
app.get("/users", async (req, res)=>{
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
app.delete("/user", async (req, res)=>{
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
app.patch("/user", async (req, res)=> {
    try{
        const userID = req.body.userId;
        const updateRequest = req.body;
        const updatedUser = await User.findByIdAndUpdate(userID, updateRequest, {returnDocument:"before"}); // return the updated document
        console.log(updatedUser);
        if (updatedUser){
            res.status(200).send({message: "User details updated successfully"});
        } else{
            res.status(404).send({message: "No user found to update"});
        }
    } catch(err){
        res.status(500).send({message: "Error updating user"});
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


