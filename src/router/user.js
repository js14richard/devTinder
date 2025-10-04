const express = require("express");
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");

const {ConnectionRequest} = require("../models/connectionRequest");

const ALLOWED_CONNECTION_FIELDS_TO_DISPLAY = ["firstName", "lastName", "skills", "gender", "about", "age", "photoUrl"];

userRouter.get("/user/requests/received", userAuth, async (req, res)=> {

    try{

        const pendingRequests = await ConnectionRequest.find({
            connectionReceiverId: req.currentUser._id,
            connectionRequestStatus: "interested" // retrieve the data only when users has sent me a connection request(interest)
        }).populate("connectionSenderId", ALLOWED_CONNECTION_FIELDS_TO_DISPLAY);

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




// List my connections

userRouter.get("/user/connections", userAuth, async (req, res)=>{

    try{
        const loggedInUserId = req.currentUser._id
        const userConnections = await ConnectionRequest.find({
            // Retrieves all the accepted connections either it can be sent by user or sent to the user
            $or:[
                {connectionSenderId : loggedInUserId, connectionRequestStatus: "accepted"}, 
                {connectionReceiverId : loggedInUserId, connectionRequestStatus: "accepted"}
            ]
        })
        .populate("connectionSenderId", ALLOWED_CONNECTION_FIELDS_TO_DISPLAY)
        .populate("connectionReceiverId", ALLOWED_CONNECTION_FIELDS_TO_DISPLAY);

        // now userConnections will ALLOWED_CONNECTION_FIELDS_TO_DISPLAY the fields for both sender and receiver
        // but we only need the other person's details
        // So if the user sent the request to someone we need to display Receiver details 
        // If someone else sent the request to user we need to display Sender details
        
        const connectionDataToDisplay = userConnections.map((row)=>{
            if(loggedInUserId.equals(row.connectionSenderId._id)){
                return row.connectionReceiverId
            } else{
                return row.connectionSenderId
            }
        });

        if(!userConnections.length){
            return res.status(404)
                .json({
                    message: "User has no connections"
                })
        };

        return res.json({
            message: "Fetched user connections sucessfully",
            data: connectionDataToDisplay
        });



    } catch(err){
        console.error(err.stack);
        return res.status(500)
            .json({
                message:"Error while fetching user connections"
            })
    }
})


module.exports = userRouter;