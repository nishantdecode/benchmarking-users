const amqp = require("amqplib");

class Amqp {
  constructor(channel, connection, link) {
    this.channel = channel;
    this.connection = connection;
    this.link = link;
  }
  connectQueue = async () => {
        // console.log("WORKING#")
        this.connection = await amqp.connect(this.link || "amqp://rabbitmq:5672");
        // console.log("WORKING@")
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue("user", { durable: false }); // Make sure to set durable to true
  };
  sendDataToQueue = async (queue, data) => {
    try {
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    } catch (error) {
      console.log(error);
    }
  };
  disconnectQueue = async () => {
    try {
      // close the channel and connection
      await this.channel.close();
      await this.connection.close();
    } catch (error) {
      console.log(error);
    }
  };

  consumeData = async (queue, callback) => {
    try {
      await this.channel?.assertQueue(queue, { durable: false });

      // Use a while loop to keep the function running
      while (true) {
        const msg = await this.channel?.get(queue); // Use channel.get to fetch a single message

        if (msg !== false) {
          callback(msg?.content.toString());
          this.channel?.ack(msg);
        } else {
          // If no message is available, wait for a short interval before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };



}

module.exports = new Amqp();
// module.exports.Amqp = Amqp;
