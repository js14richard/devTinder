const ADMIN_TOKEN = "admin123";
const USER_TOKEN = "user123";

function checkUserAuth(req, res, next){
    const token = extractAuthTokenFromHeader(req, res, next);
    if (token === USER_TOKEN){
        next();
    } else{
        res.status(401).send({message: "Unauthorized"});
    }
}

function checkAdminAuth(req, res, next){
    const token = extractAuthTokenFromHeader(req, res, next);
    if (token === ADMIN_TOKEN){
        console.log("admin authenticated");
        next();
    } else{
        res.status(401).send({message: "Unauthorized"});
    }
}

function extractAuthTokenFromHeader(req, res, next){
    try{
        const authHeader = req.headers.authorization;
        if(authHeader){
            const token = authHeader.split(" ")[1];
            return token;
        }
        throw new Error("No token found");
    } catch(err){
        res.status(401).send({message: "Unauthorized"});
    }
}


module.exports = {checkUserAuth, checkAdminAuth};