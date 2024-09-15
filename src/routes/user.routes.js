const express = require("express");
const { Auth } = require("../middlewares/auth.middlewares");
const access = require("../middlewares/access.middlewares");
const { UserController } = require("../controllers/user.controllers");

const router = express.Router();

//get requests
router.get("/", [Auth, access("SuperAdmin")], UserController.getAllUsers);
router.get("/:userId", [Auth], UserController.getUser);
router.get("/admin/users", [Auth, access("Admin")], UserController.getAllUsersOfAdmin);

//post requests
router.post("/register", UserController.register);
router.post("/sendOtp", UserController.sendOtp);
router.post("/verifyOtp", UserController.verifyOtp);

router.post("/login", UserController.login);
router.post("/refreshToken", UserController.refreshToken);
router.post("/verifyToken", [Auth], UserController.verifyToken);
router.post("/resetPassword", UserController.resetPassword);

//put requests
router.put("/:userId", [Auth], UserController.updateUser);

//delete requests
router.delete("/:userId", [Auth], UserController.deleteUser);

module.exports.UserRouter = router;
