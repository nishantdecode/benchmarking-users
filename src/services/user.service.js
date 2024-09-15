const { User } = require("../models/user.model");
const BasicServices = require("./basic.service");
const amqp = require("../setup/amqp.setup.js");

class UserService extends BasicServices {
  constructor() {
    super(User);
  }
  aggregate = (pipeline) => {
    return this.modal.aggregate(pipeline);
  };
  async verifyPassword(password, currentPass) {
    return await this.modal.schema.methods.verifyPassword(password, currentPass);
  }
  async verifyToken(token) {
    return await this.modal.schema.methods.verifyToken(token);
  }
  async decodeToken(token) {
    return await this.modal.schema.methods.decodeToken(token);
  }
  async verifyRefreshToken(token) {
    return await this.modal.schema.methods.verifyRefreshToken(token);
  }
  async generateToken(data) {
    return await this.modal.schema.methods.generateToken(data);
  }
  async generateRefreshToken(data) {
    return await this.modal.schema.methods.generateRefreshToken(data);
  }
  async sendTestMsgInQue() {
    const rabbitmq = amqp;
    try {
      await rabbitmq.connectQueue();
      await rabbitmq.sendDataToQueue("test", { message:"Test Successfull"});
    } catch (error) {
      console.error("Error syncing user data:", error);
    } finally {
      await rabbitmq.disconnectQueue();
    }
  }
  
}

module.exports.UserService = new UserService();
