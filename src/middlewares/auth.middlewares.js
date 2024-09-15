const { UserService } = require("../services/user.service");

const Logger = require("../helpers/logger.helpers");
const HttpError = require("../helpers/HttpError.helpers");

const Auth = async (req, res, next) => {
  const token = req.headers['authorization'].split(" ")[1];
  if (!token) {
    throw new HttpError(401, "Unauthorized: Missing Token");
  }
  const decodedData = await UserService.verifyToken(token);

  if (decodedData instanceof Error) {
    throw new HttpError(401, "Token Expired!");
  }

  const user = await UserService.findOne({email: decodedData.email});

  if (!user) {
    throw new HttpError(401, "Unauthorized: Invalid Token");
  }

  req.user = user;

  Logger.info(`User authenticated!`);
  next();
};

module.exports = { Auth };
