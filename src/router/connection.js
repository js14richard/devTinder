const express = require("express");
const connectionRouter = express.Router();

const {userAuth} = require("../middlewares/auth");


// Connection request route
connectionRouter.post("/sendConnectionRequest", userAuth, async(req, res)=> {
    try{
        const userName = req.currentUser.firstName;
        res.send({message:`${userName} sent a connection request`});

    } catch(err){
        console.error(`sendConnectionRequest failed : ${err.message}`);
        res.status(500).message({message:"Something went wrong"});
    }
});


module.exports = connectionRouter;