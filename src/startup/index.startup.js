const { NODE_ENV, PORT_DEV, PORT_PROD } = process.env;
const { isConnectedWithRabbitMQ } = require("../services/rabbitmq.service");
const rabitMQListners = require("./rabitmq_listners.startup");
const Logger = require("../helpers/logger.helpers");

module.exports = async (app) => {
  let isConnected = false;
  var HOC =async function( callback ) {
    // Do some things that belong to HOC, like creating the result object.
    isConnected = await isConnectedWithRabbitMQ();

    // Call the repeat function, using the result as the parameter.
    callback();
  };
  var repeat =async function(  ) {
    // Write the result somewhere
    if(!isConnected){
      setTimeout(async ()=>{
        console.log("RETRYING TO CONNECT WITH RABBITMQ")
        await HOC( repeat );
      },5000)
    }else{
      console.log("CONNECTED TO RABBITMQ")
      rabitMQListners();
    }
    // console.log("CONNECTED")
  };
  await HOC( repeat );
  await require("./db.startup")(app); //intiate db connection
  require("./routes.startup")(app); // intiate routes
  require("./error.startup")(app); // intiate error handlers

  const PORT = NODE_ENV === "development" ? PORT_DEV : PORT_PROD
  
  //Starting Server
  app.listen(PORT || 8080, () => {
    Logger.info(`🚀 Benchmarking User Server is Running on PORT => ${PORT}`, PORT || 3001);
  });
};
