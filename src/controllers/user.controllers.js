const { sendMail } = require("../helpers/mailSender.helper");
const HttpError = require("../helpers/HttpError.helpers");
const Response = require("../helpers/Response.helpers");
const Logger = require("../helpers/logger.helpers");
const mongoose = require("mongoose");

const { UserService } = require("../services/user.service");
const { OrganisationService } = require("../services/organisation.service");

class UserController {
  //@desc Register a user
  //@route POST /api/user/register
  //@access public
  register = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const { creatorId, name, password, email, role } = req.body;
    if (!name.first || !name.last || !email || !role.type) {
      throw new HttpError(400, "All fields Mandatory!");
    }

    if (role.type === "Admin" || role.type === "User") {
      if (!req.body.organisationId) {
        throw new HttpError(400, "All fields Mandatory!");
      }
    }

    const creator = await UserService.findById(creatorId);

    if ((role.type === "User" || role.type === "Admin") && !creator) {
      throw new HttpError(
        400,
        "User not associated to any admin or superadmin!"
      );
    }

    let generatedPassword = password;

    if (!password) {
      generatedPassword = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
    }

    const userAvailable = await UserService.findOne({ email });
    if (userAvailable) {
      throw new HttpError(400, "User already registered!");
    }

    const user = await UserService.create({
      ...req.body,
      password: generatedPassword,
    });

    await sendMail(
      email,
      "Your account has been successfully created!",
      `Login to benchamrking using email: ${email} and password: ${generatedPassword}`
    );

    const userObj = {
      id: user._id,
      name: name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    if (user) {
      Logger.info(
        `User Created: ${userObj} GeneratedPassword: ${generatedPassword}`
      );
      Response(res)
        .status(201)
        .message("User created successfully")
        .body({ userObj })
        .send();
    } else {
      throw new HttpError(400, "User data is not valid");
    }
  };

  //@desc send OTP to a user for registeration
  //@route POST /api/user/sendOtp
  //@access public
  sendOtp = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const { email } = req.body;
    const user = await UserService.findOne({ email });
    if (!user) {
      throw new HttpError(401, "User does not exsist!");
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.registerOtp.otp = otp;
    user.registerOtp.expiresAt = Date.now() + 43200000;
    await user.save();

    await sendMail(
      email,
      "OTP Verification",
      `Your OTP for verification is: ${otp}`
    );

    const userObj = {
      id: user._id,
      name: user.name,
      email: user.email,
      otp: user.registerOtp.otp,
    };
    console.log(user);
    Logger.info(`OTP sent to email: ${userObj.otp}`);
    Response(res).status(200).message("OTP sent to email!").body().send();
  };

  //@desc verify OTP sent to a user for registeration and login
  //@route POST /api/user/verifyOtp
  //@access public
  verifyOtp = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const { email, otp } = req.body;
    const user = await UserService.findOne({ email });
    if (!user) {
      throw new HttpError(401, "User does not exist!");
    }

    if (user.registerOtp.otp !== otp) {
      throw new HttpError(401, "Invalid Otp!");
    }

    user.emailVerified = true;
    user.registerOtp = undefined;
    await user.save();

    Logger.info(`OTP has been verified: ${user}`);
    Response(res).status(200).message("OTP has been verified!").body({}).send();
  };

  //@desc login user after email verification through OTP
  //@route POST /api/user/login
  //@access public
  login = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpError(400, "All fields Mandatory!");
    }

    const user = await UserService.findOne({ email });

    if (user) {
      const userVerified = await UserService.verifyPassword(
        password,
        user.password
      );
      if (!userVerified) {
        throw new HttpError(401, "Invalid Credentials!");
      }
    } else {
      throw new HttpError(401, "User does not exsist!");
    }

    const accessToken = await UserService.generateToken({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await UserService.generateRefreshToken(user.email);

    user.refreshToken = refreshToken;
    await user.save();

    Logger.info(`User logged In: ${accessToken}`);
    Response(res)
      .status(200)
      .message("User logged In successfully")
      .body({ token: accessToken })
      .send();
  };

  //@desc if user forgets password then send Token to a user for authentication
  //@route POST /api/user/refreshToken
  //@access private
  refreshToken = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Unauthorized: Missing Token");
    }
    const decodedData = await UserService.decodeToken(token);

    const user = await UserService.findOne({ email: decodedData.email });

    const refreshToken = user.refreshToken;
    if (!refreshToken) {
      throw new HttpError(401, "Invalid refresh token!");
    }

    const decodedRefreshToken = await UserService.verifyRefreshToken(
      refreshToken
    );

    if (decodedRefreshToken instanceof Error) {
      throw new HttpError(401, "Refresh Token Expired!");
    }

    const newAccessToken = await UserService.generateToken({
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const userObj = {
      id: user._id,
      creatorId: user.creatorId,
      organisationId: user.organisationId,
      picture: user.picture,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    Logger.info(`Token refreshed: ${newAccessToken}`);
    Response(res)
      .status(200)
      .message("Token refreshed!")
      .body({ token: newAccessToken, userObj })
      .send();
  };

  //@desc if user forgets password then verify Token sent to the user for authentication and login
  //@route POST /api/user/verifyToken
  //@access private
  verifyToken = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const userObj = {
      id: req.user._id,
      creatorId: req.user.creatorId,
      organisationId: req.user.organisationId,
      picture: req.user.picture,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    };

    Logger.info(`Accesstoken verified!`);
    Response(res)
      .status(200)
      .message("Accesstoken verified!")
      .body({ userObj })
      .send();
  };

  //@desc reset Password for logged in user
  //@route POST /api/user/resetPassword
  //@access private
  resetPassword = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const { email, newPassword } = req.body;
    const user = await UserService.findOne({ email });
    if (!user || !user.emailVerified) {
      throw new HttpError(401, "User does not exsist!");
    }

    user.password = newPassword;
    user.emailVerified = false;
    await user.save();

    const userObj = {
      id: user._id,
      creatorId: user.creatorId,
      picture: user.picture,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    Logger.info(`Password has been reset: ${userObj}`);
    Response(res).status(200).message("Password has been reset!").body().send();
  };

  //@desc get all users
  //@route GET /api/user/
  //@access private (SuperAdmin)
  getAllUsers = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const usersFound = await UserService.aggregate([
      {
        $match: {
          "role.type": { $ne: "SuperAdmin" },
        },
      },
    ]);

    const users = await Promise.all(
      usersFound.map(async (user) => {
        const organisation = await OrganisationService.findById(
          user.organisationId
        );
        return {
          id: user._id,
          creatorId: user.creatorId,
          organisation: organisation?.name,
          picture: user.picture,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      })
    );

    Response(res).status(200).message("All users").body({ users }).send();
  };

  //@desc get user by userId
  //@route GET /api/user/:userId
  //@access private (auth)
  getUser = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const userId = req.params.userId;
    const user = await UserService.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          creatorId: 1,
          picture: 1,
          name: 1,
          email: 1,
          role: 1,
          organisationId: 1,
        },
      },
    ]);

    const userFound = user[0];

    if (!userFound) {
      throw new HttpError(404, "User not found");
    }

    if (req.user.role.type !== "SuperAdmin") {
      if (
        req.user.organisationId.toString() !==
          userFound.organisationId.toString() &&
        userFound.id.toString() !== req.user._id.toString()
      ) {
        throw new HttpError(401, "Unauthorized!");
      }
    }

    Logger.info(`User: ${userFound}`);
    Response(res)
      .status(200)
      .message("User found")
      .body({ user: userFound })
      .send();
  };

  //@desc get all users of an organization(admin)
  //@route GET /api/user/admin/users
  //@access private (Admin)
  getAllUsersOfAdmin = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const organisationId = req.user.organisationId;

    const usersFound = await UserService.aggregate([
      { $match: { organisationId, "role.type": "User" } },
    ]);

    const users = await Promise.all(
      usersFound.map(async (user) => {
        const organisation = await OrganisationService.findById(
          user.organisationId
        );
        const name = organisation.name;
        return {
          id: user._id,
          creatorId: user.creatorId,
          organisation: name,
          picture: user.picture,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      })
    );

    Logger.info(`All users: ${users}`);
    Response(res).status(200).message("All users").body({ users }).send();
  };

  //@desc update user by userId
  //@route PUT /api/user/:userId
  //@access private
  updateUser = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const userId = req.params.userId;
    const userFound = await UserService.findById(userId);

    const updates = req.body;

    if (req.user.role.type !== "SuperAdmin") {
      if (
        req.user.organisationId.toString() !==
          userFound.organisationId.toString() &&
        userFound.id.toString() !== req.user._id.toString()
      ) {
        throw new HttpError(401, "Unauthorized!");
      }
    }

    const user = await UserService.findByIdAndUpdate(
      userId,
      { ...updates },
      { new: true }
    );

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    Logger.info(`User Updated: ${user}`);
    Response(res).status(200).message("User Updated").body({ user }).send();
  };

  //@desc delete user by userId
  //@route DELETE /api/user/:userId
  //@access private
  deleteUser = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const userId = req.params.userId;
    const userFound = await UserService.findById(userId);

    if (req.user.role.type !== "SuperAdmin") {
      if (
        req.user.organisationId.toString() !==
          userFound.organisationId.toString() &&
        userFound.id.toString() !== req.user._id.toString()
      ) {
        throw new HttpError(401, "Unauthorized!");
      }
    }

    const user = await UserService.findByIdAndDelete(userId);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    Logger.info(`User Deleted: ${user}`);
    Response(res).status(200).message("User Deleted").body({ user }).send();
  };
}

module.exports.UserController = new UserController();
