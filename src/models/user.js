const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minlength:[2, "First name must be at least 2 characters"], // custom error message can be given else mongoose default message will be used
        maxlength:30,
    }, 
    lastName:{
        type:String,
        maxlength:30,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true, // remove whitespace
        match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // regex for email validation
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        maxlength:1024,
        select:false, // do not return password field in queries by default
    }, 
    skills :{
        type:[String], // array of strings
        default:[],
    },
    gender :{
        type:String,
        enum:["male", "female", "others"],
    }, 
    age:{
        type:Number,
        min:[18, "Age must be at least 18"],
    }, 
    aobut:{
        type:String,
        maxlength:500,
        default:"This is about me... added by default",
    }, 
    photoUrl:{
        type:String,
        default:"https://example.com/default-profile.png",
    }
}, 
{timestamps:true} // adds createdAt, updatedAt by default
);

const User = mongoose.model("User", userSchema);

module.exports = User;