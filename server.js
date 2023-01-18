const express = require('express');
const router = require('./routers/user')
const PORT = 7772;;
const app = express();
app.use(express.json())


app.get('/', (req, res)=>{
    res.send("WELCOME TO AUTHENTICATION TUTORIAL")
})

app.use('/api', router);
app.listen(PORT, function(){
    console.log("App listening on PORT: " + PORT)
})