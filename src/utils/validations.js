
const ALLOWED_USER_FIELDS_FOR_UPDATE = ["firstName", "lastName", "skills", "age", "about", "photoUrl"];

const validateSignupData = (req) => {
    const {firstName, email, password} = req.body;

    if (!firstName || firstName.length < 2 || firstName.length > 30){
        throw new Error("First name must be between 2 and 30 characters");
    }

    if (!email || !/^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)){
        throw new Error("Invalid email format");
    }

    if (!password || password.length < 6 || password.length > 20){
        throw new Error("Password must be between 6 and 20 characters");
    }
    
}

const isValidProfileUpdateRequest = (req) => {
    return Object.keys(req.body).every((key)=>ALLOWED_USER_FIELDS_FOR_UPDATE.includes(key));
}


module.exports = {validateSignupData, isValidProfileUpdateRequest};
