require('dotenv').config();
const mongoose = require("mongoose");
const clusterUrl = process.env.MONGODB_URI;
if (!clusterUrl) {
    throw new Error("MONGODB_URI is not configured in .env");
}


const connectToMongoDB = async ()=> {
    console.log("Connecting to MongoDB cluster...");
    try{
        await mongoose.connect(clusterUrl);
    } catch(err){
        throw new Error("Error connecting to MongoDB cluster: " + err.message);
    }
};

module.exports = connectToMongoDB;