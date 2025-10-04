const express = require("express");
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");

const {ConnectionRequest} = require("../models/connectionRequest");

userRouter.get("/user/requests/received", userAuth, async (req, res)=> {

    try{
        const ALLOWED_CONNECTION_SENDER_FIELDS_TO_DISPLAY = ["firstName", "lastName", "skills", "gender", "about", "age", "photoUrl"];

        const pendingRequests = await ConnectionRequest.find({
            connectionReceiverId: req.currentUser._id,
            connectionRequestStatus: "interested" // retrieve the data only when users has sent me a connection request(interest)
        }).populate("connectionSenderId", ALLOWED_CONNECTION_SENDER_FIELDS_TO_DISPLAY);

        console.log(pendingRequests);

        if(!pendingRequests.length){
            return res.status(404)
                .json({message:"No connection requests found"});
        }
        
        return res.json({
            message:"Fetched connection requests sucessfully", 
            data: pendingRequests
        })


    } catch(err){
        return res.status(500)
            .json({message:"Error while fetching the connection requests"});
    }
});



module.exports = userRouter;