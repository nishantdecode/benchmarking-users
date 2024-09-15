//middlewares
const express = require("express");
const morgan = require("morgan"); // for consoling api request calls
const helmet = require("helmet"); // secures connection by adding additional header
const cors = require("cors"); // handling cors errors
const ErrorHandler = require("../middlewares/error.middlewares"); // error handler for routes, since we will continue to next route upon request
const { NODE_ENV, ORIGIN_DEV, ORIGIN_PROD } = process.env;

//logger
const Logger = require("../helpers/logger.helpers");

//Routers
const { UserRouter } = require("../routes/user.routes");
const { OrganisationRouter } = require("../routes/organisation.routes");

module.exports = (app) => {

  app.use(express.json({ limit: "1024mb" })); // body parser, parses request body
  app.use(express.urlencoded({ extended: true })); // parses encoded url
  app.use(morgan("tiny")); // initiating console api requests
  app.use(helmet());

  const corsOptions = {
    origin: NODE_ENV === "development" ? ORIGIN_DEV : ORIGIN_PROD,
    // origin:"*",
    credentials: true, // Allow cookies
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Content-Type',
      'Authorization',
    ]
  };

  app.use(cors(corsOptions));

  //start of routes
  app.use("/api/user", UserRouter);
  app.use("/api/organisation", OrganisationRouter);
 
  //end of routes

  //handling async errors in apis
  app.use(ErrorHandler);

  //adding additional apis
  app.get("/", (req, res) =>
    res.send({
      error: false,
      message: "BENCHMARKING USER SERVER IS LIVE!",
      result: null,
    })
  );
  app.get("*", (req, res) =>
    res
      .status(404)
      .send({ error: true, message: "Route not Found!", result: null })
  );
};

Logger.info("🛣️  Routes setup completed");
