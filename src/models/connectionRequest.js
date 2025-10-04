const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    connectionSenderId :{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }, 
    connectionReceiverId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }, 
    connectionRequestStatus : {
        type: String,
        required: true, 
        enum:{
            values: ["ignored", "interested", "accepted", "rejected"],
            message: "Invalid connection status"
        }
    }
},
 {timestamps: true}
);

// 
connectionRequestSchema.pre("save", async function(next){
    if(this.connectionSenderId.equals(this.connectionReceiverId)){
        return next(new Error("You can't send a connection to yourself"));
    }
    next();
});

connectionRequestSchema.index({connectionSenderId:1, connectionReceiverId:1});
connectionRequestSchema.index({connectionReceiverId:1, connectionSenderId:1});

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);


module.exports = {ConnectionRequest};