/* eslint-disable */


const express = require('express');
const {checkUserAuth, checkAdminAuth} = require('./middlewares/auth');
const app = express();

// Auth middleware for admin routes
app.use("/admin", checkAdminAuth, (req, res, next) => {
    console.log("admin authenticated in router"); 
    next();
});

// Auth middleware for user routes
app.use("/user", checkUserAuth, (req, res, next) => {
    console.log("user authenticated in router");
    next();
});


app.get("/user/show_profiles", (req, res, next)=> {
    res.send("Profile details").status(201);
});

app.get("/admin/dashboard", (req, res, next)=>{
    res.send("Admin dashboard").status(200);
});

app.get("/user/list", (req, res)=> {
    res.send({
        name: 'Siril',
        age: 24,
    });
});

// Route with single parameter
app.get("/user/:id", (req, res) => {
    const userId = req.params.id;
    console.log(req.params);
    res.send({
        id: userId,
        name: 'Siril',
        age: 24,
    });
});

// Route with multiple parameters
app.get("/user/:id/:name/:age", (req, res) => {
    const userId = req.params.id;
    const userName = req.params.name;
    const userAge = req.params.age;
    console.log(req.params);
    res.send({
        id: userId,
        name: userName,
        age: userAge,
    });
});

app.post("/users", (req, res) =>{
    res.send('POST Users route');
});

// This will match all HTTP methods (GET, POST, PUT, DELETE, etc.) for the /users path
// Won't be used if specific method routes are defined above
app.use("/users", (req, res)=> {
    res.send('Users route');
});

// Add this route at the end to avoid overriding other routes as / matches all paths
// Error handling
app.use("/", (err, req, res, next) => { 
    if(err){
        res.status(500).res.send("Internal server error");
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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});