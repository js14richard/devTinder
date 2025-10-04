const express = require("express");
const mongoose = require("mongoose");
const connectionRouter = express.Router();

const {userAuth} = require("../middlewares/auth");
const {ConnectionRequest} = require("../models/connectionRequest");
const {User} = require("../models/user");


// Connection request route
connectionRouter.post("/send/request/:status/:connectionReceiverId", userAuth, async(req, res)=> {
    try{
        const ALLOWED_CONNECTION_REQUEST_STATUS = ["interested", "ignored"];

        const connectionRequestStatus = req.params.status;
        const connectionReceiverId = req.params.connectionReceiverId;
        const connectionSenderId = req.currentUser._id;
        let connectionReceiver = null;

        if(!connectionRequestStatus || !ALLOWED_CONNECTION_REQUEST_STATUS.includes(connectionRequestStatus)){
            return res.status(400)
                .json({
                    message:"Invalid request status"
                })
        }

        if(connectionReceiverId){
            connectionReceiver = await User.findById(connectionReceiverId);
        }

        if(!connectionReceiver){
            return res.status(400)
                .json({
                    message:"Invalid connection receiver"
                })
        }        

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {connectionSenderId, connectionReceiverId}, 
                {connectionReceiverId, connectionSenderId} // Checking both sender & receiver don't have an existing connection to each other
            ]
        })

        if (existingConnectionRequest){
            return res.status(400)
                .json({
                    message:"Connection request already exists"
                })
        }

        const newConnectionRequest = new ConnectionRequest({
            connectionSenderId,
            connectionReceiverId,
            connectionRequestStatus
        })

        const connectionRequestData = await newConnectionRequest.save();

        if(connectionRequestData){
            return res.status(200)
                .json({
                    message: `${req.currentUser.firstName} ${connectionRequestStatus} ${connectionReceiver.firstName}`,
                    data: connectionRequestData
                })
        }

    } catch(err){
        console.error(`sendConnectionRequest failed : ${err.stack}`);
        res.status(500).json({message:"Something went wrong"});
    }
});


// Connection review route

connectionRouter.post("/request/review/:status/:requestId", userAuth, async (req, res)=> {
    try{
        const {status, requestId} = req.params;
        const ALLOWED_STATUS = ["accepted", "rejected"];
        
        if(!ALLOWED_STATUS.includes(status)){
            return res.status(400)
                .json({message: "Invalid status to review"})
        }
        
        if(!requestId || !mongoose.Types.ObjectId.isValid(requestId)){
            return res.status(400)
                .json({message: "Invalid request Id"})  
        }

        const connectionData = await ConnectionRequest.findOne({
            _id : requestId,
            connectionRequestStatus : "interested", // Users can either accept or rejected only when someone intersed them
            connectionReceiverId : req.currentUser._id // This ensures user takes action only to the request which was sent by others to him
        }).populate("connectionSenderId", ["firstName"]);

        if(!connectionData){
            return res.status(404) 
                .json({message: "Connection request not found"});
        }

        if(!connectionSenderData){
            return res.status(404)
                .json({message:"Invalid connection sender"});
        }

        connectionData.connectionRequestStatus = status;

        const updatedConnectionData = await connectionData.save();

        if(updatedConnectionData){
            return res.status(200)
                .json({
                    message:`${req.currentUser.firstName} has ${status} ${connectionData.connectionSenderId.firstName}'s connection request`, 
                    data: updatedConnectionData
                });
        } else{
            return res.status(400)
                .json({message:"Unable to update connection request"});
        }

        
    } catch(err){
        console.error(`Connection review failed ${err.stack}`);
        return res.status(500)
            .json({message:"Connection review failed"})
    }
});


module.exports = connectionRouter;