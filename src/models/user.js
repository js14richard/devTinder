const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET_KEY = "devTinder_2%25";

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minlength:[2, "First name must be at least 2 characters"], // custom error message can be given else mongoose default message will be used
        maxlength:30,
    }, 
    lastName:{
        type:String,
        validate:{ // this can be done with maxlength too, but here is an example of custom validator function
            validator: function(value){
                return value.length <= 10;
            }, 
            message: props => `${props.value} last name exceeds maximum length of 30 characters`
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true, // remove whitespace
        match:/^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, // regex for email validation
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
        validate(value){
            if (!value.startsWith("http")){
                throw new Error("Photo URL must start with http");
            }
        }
    }
}, 
{timestamps:true} // adds createdAt, updatedAt by default
);

// adding a instance methods for better readability
// we can't use arrow function as we won't be able to access properties using this._id etc..
userSchema.methods.getJWT = async function(){
    return jwt.sign({userId: this._id}, JWT_SECRET_KEY, {expiresIn:"10h"});
}

userSchema.methods.isPasswordMatch = async function(userInputPassword){
    return await bcrypt.compare(userInputPassword, this.password);
}

const User = mongoose.model("User", userSchema);

module.exports = {User};