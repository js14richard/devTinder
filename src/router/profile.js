const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

const {User} = require("../models/user");

const {userAuth} = require("../middlewares/auth");

const {isValidProfileUpdateRequest} = require("../utils/validations");


// GET : Profile route

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    
    // currentUser was appended in req by auth middleware
    const user = await User.findById(req.currentUser._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. The account may no longer exist."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
});



// Edit profile route

profileRouter.patch("/profile/edit",userAuth, async (req, res)=>{
    try{
        if(!isValidProfileUpdateRequest(req)){
            return res.status(403)
                .json({
                    message:"Invalid update request"
                })
        }
        const userProfile = req.currentUser;
        const updatedUserProfile = await User.findByIdAndUpdate(userProfile._id, req.body, {runValidators: true, returnDocument:"after"});
        if(updatedUserProfile){
            return res.status(200)
                .json({
                    message:"User profile updated successfully", 
                    userProfile: updatedUserProfile,
                })
        }else{
            return res.status(400)
                .json({
                    message:"User profile update failed"
                })
        }        
    } catch(err){
        console.error(`Error while updating user profile ${err.stack}`);
        return res.status(500)
            .json({
                message:"Something went wrong"
            })
    }
});


// Forget Password

/**
 * finding findById again to here to fetch password
 * as it was restricted while fetching in userAuth middleware and we don't want to expose password for other routes
 * Once passowrd is reset, clear the cookie and let user login again.
 */

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try{
        const currentUser = await User.findById(req.currentUser._id).select("+password");
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword){
            return res.status(400)
                .json({
                    message:"Both current and new password are required"
                })
        }

        if(currentPassword === newPassword){
            return res.status(400)
                .json({
                    message:"New password can't be same as current password"
                })
        }

        // Checks whether user entered current password matches with password hash in DB
        if(await currentUser.isPasswordMatch(currentPassword)){
            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            currentUser.password = newPasswordHash;
            const updatedUser = await currentUser.save();
            if(updatedUser){
                return res.status(200)
                    .clearCookie("jwtToken", {httpOnly:true})
                    .json({
                        message:"Password updated successfully"
                    })
            } else{
                return res.status(400)
                    .json({
                        message:"Failed to update password"
                    })
            }

        } else{
            return res.status(403)
                .json({
                    message:"Current Password doesn't match"
                })
        }
    } catch(err){
        console.error(err.stack);
        return res.status(500)
            .json({
                message:"Error while updating password"
            })
    }
});


module.exports = profileRouter;