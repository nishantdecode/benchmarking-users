const mongoose = require("mongoose");
const Logger = require("../helpers/logger.helpers");
const { DB_URI } = process.env;
// const DB_URI  ="mongodb+srv://GaganChaudhary6378:Gagan1234@cluster0.abpxehe.mongodb.net/Testing?retryWrites=true&w=majority"

module.exports = () => {
  return mongoose
    .connect(DB_URI)
    .then((res) => Logger.info("💽 Database is Connected Successfully"))
    .catch((err) => Logger.info("Please Restart Server", err));
};
