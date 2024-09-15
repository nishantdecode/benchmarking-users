const {
    getTestQueData,
    // getUserDataViaUserServer,
    
  } = require("../services/rabbitmq.service");
  // const { UserService } = require("../services/user.service");
  
  module.exports = async () => {
    getTestQueData();
    // getUserDataViaUserServer();
  };
  