# devTinder

Creating routes in express
•	Regex pattern can be used in endpoint path
•	Multiple route handlers (using next())
•	Use middleware (for auth)

•	Npm install bcrypt -> used for password hashing

•	Npm install cookie-parser -> used to parse cookie to get cookies from API calls

•	JWT contains three parts -> Headers, payload, signature 

•	Npm install jsonwebtoken -> to build jwt token

•	app.get() → Direct route on app:
o	app.get("/about", (req,res)=>res.send("About page"));
•	router.get() → Route inside router, mounted on app:
o	router.get("/about", (req,res)=>res.send("About page"));
o	app.use("/info", router); // → /info/about

•	mongoose Schema -> pre(“save”) and internal methods
•	mongoDb indexing -> left-prefix rule 
•	ref and populate in mongodb [kind of joins in sql]
•	skip() , limit() -> to build pagination
