const express = require("express");
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");

const {ConnectionRequest} = require("../models/connectionRequest");

const {User} = require("../models/user");

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

// Feed route

/**
 * A User should not see himself in the feed
 * User should not see his connections in the feed
 * User should not see if there is a connection request [either user sent or sent to the user]
*/

userRouter.get("/feed", userAuth, async (req, res)=> {
    try{
        const loggedInUserId = req.currentUser._id;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 50;
        limit = limit > 50 ? 50 : limit;

        // Calculate how many documents to skip for pagination
        // Example: page 1 => skip 0, page 2 => (2-1)*50 so skip first 50 to display in the second page
        const skip = (page-1)*limit; 
            

        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {connectionSenderId : loggedInUserId}, 
                {connectionReceiverId: loggedInUserId}
            ]
        }).select("connectionSenderId connectionReceiverId");

        // connectionRequests have duplciates as the current user will be receiver for many requests 
        // We need to remove the data and just have unique 
        const hideUsersFromFeed = new Set(); // set to prevent duplicates
        hideUsersFromFeed.add(loggedInUserId.toString());

        connectionRequests.forEach((request)=>{
            hideUsersFromFeed.add(request.connectionSenderId.toString());
            hideUsersFromFeed.add(request.connectionReceiverId.toString());
        });

        // only finding the users who don't have existing connection or request
        const finalFeed = await User.find({
            _id : {$nin : Array.from(hideUsersFromFeed)}
        }).skip(skip).limit(limit);

        return res.json({
            message:"Fetched user feed succesfully",
            data: finalFeed
        })

    } catch(err){
        console.error(err.stack);
        return res.status(500)
            .json({message:"Error fetching feed"})
    }
});


module.exports = userRouter;