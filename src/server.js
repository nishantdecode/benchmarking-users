require("dotenv").config(); // intitializing env file
require("express-async-errors"); // catches any async error in the API, no need for any other ErrorHandling like try-catch // will work only after listening, middleware
const express = require("express");
const { UserService } = require("./services/user.service");
const app = express();

//initiating SERVERR
require("./startup/index.startup")(app);

app.get("/test",async (req,res)=>{
    await UserService.sendTestMsgInQue();
    res.send("Message sent to que")
  })
  