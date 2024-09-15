const express = require("express");
const { Auth } = require("../middlewares/auth.middlewares");
const access = require("../middlewares/access.middlewares");
const { OrganisationController } = require("../controllers/organisation.controllers");

const router = express.Router();

//get requests
router.get("/", [Auth, access("SuperAdmin")], OrganisationController.getAllOrganisations);
router.get("/names", [Auth, access("SuperAdmin")], OrganisationController.getAllOrganisationNames);
router.get("/:organisationId", [Auth, access("SuperAdmin")], OrganisationController.getOrganisation);

//post requests
router.post("/create", [Auth, access("SuperAdmin")], OrganisationController.create);

//put requests
router.put("/:organisationId", [Auth, access("SuperAdmin")], OrganisationController.updateOrganisation);

//delete requests
router.delete("/:organisationId", [Auth, access("SuperAdmin")], OrganisationController.deleteOrganisation);

module.exports.OrganisationRouter = router;
