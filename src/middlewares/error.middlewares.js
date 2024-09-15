const Response = require("../helpers/Response.helpers");
const Logger = require("../helpers/logger.helpers");

// will automatically respond back if any error occurs in the API
module.exports = (err, req, res, next) => {
  try {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    Logger.error(err)
    Response(res).status(status).error(message).send();
  } catch (error) {
    // next(error);
    Logger.error(error)
  }
};
