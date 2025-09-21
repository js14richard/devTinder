const express = require('express');
const app = express();

app.use("/users", (req, res)=> {
    res.send('Users route');
});

app.use("/admin", (req, res)=>{
    res.send('Admin route');
});

// Add this route at the end to avoid overriding other routes as / matches all paths
app.use("/", (req, res) => { 
    res.send('Static route');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});