const amqp = require("../setup/amqp.setup");

module.exports.isConnectedWithRabbitMQ = async () => {
    // console.log("INSIDE FUNC")
    try {
      const test = await amqp
      .connectQueue()
      return true
    } catch (error) {
      return false
    }
  return 

};

module.exports.getTestQueData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await amqp.consumeData("test", (msg) => {
        // Handle the received message here
        console.log("Received inside", msg);

        // Resolve the Promise with the finalData
        resolve(msg);
      });
    } catch (error) {
      console.error("Error getting user data:", error);
      reject(error);
    } finally {
      await amqp.disconnectQueue();
    }
  });
};


