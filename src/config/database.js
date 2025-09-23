
const mongoose = require("mongoose");
const clusterUrl = "mongodb+srv://js14richard_db_user:x7KcX2ZFPZf216cj@richitech.ref1hdl.mongodb.net/";


const connectToMongoDB = async ()=> {
    console.log("Connecting to MongoDB cluster...");
    try{
        await mongoose.connect(clusterUrl);
    } catch(err){
        throw new Error("Error connecting to MongoDB cluster", err);
    }
};

module.exports = connectToMongoDB;