const express = require("express");
const profileRouter = express.Router();

const {User} = require("../models/user");

const {userAuth} = require("../middlewares/auth");

// GET : Profile route

profileRouter.get("/profile", userAuth, async (req, res) => {
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



module.exports = profileRouter;