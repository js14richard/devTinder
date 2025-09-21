const express = require('express');
const app = express();

app.get("/users", (req, res)=> {
    res.send({
        name: 'Siril',
        age: 24,
    });
});

app.get("/user/:id", (req, res) => {
    const userId = req.params.id;
    res.send(`User ID: ${userId}`);
});

app.post("/users", (req, res) =>{
    res.send('POST Users route');
});

// This will match all HTTP methods (GET, POST, PUT, DELETE, etc.) for the /users path
// Won't be used if specific method routes are defined above
app.use("/users", (req, res)=> {
    res.send('Users route');
});

// Add this route at the end to avoid overriding other routes as / matches all paths
app.use("/", (req, res) => { 
    res.send('Static route');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});