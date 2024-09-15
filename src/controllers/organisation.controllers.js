const HttpError = require("../helpers/HttpError.helpers");
const Response = require("../helpers/Response.helpers");
const Logger = require("../helpers/logger.helpers");
const mongoose = require("mongoose");

const { OrganisationService } = require("../services/organisation.service");

class OrganisationController {
  //@desc create a organisation
  //@route POST /api/organisation/create
  //@access public
  create = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const { name, headquarter, contact } = req.body;
    if (!name || !headquarter || !contact) {
      throw new HttpError(400, "All fields Mandatory!");
    }

    const organisationAvailable = await OrganisationService.find({
      name,
      headquarter,
    });
    if (organisationAvailable.length !== 0) {
      throw new HttpError(400, "Organisation already exists!");
    }

    const organisation = await OrganisationService.create({ ...req.body });

    Response(res)
      .status(201)
      .message("Organisation created successfully")
      .body(organisation)
      .send();
  };

  //@desc get all organisations
  //@route GET /api/organisation/
  //@access private (SuperAdmin)
  getAllOrganisations = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const organisations = await OrganisationService.aggregate([
      { $match: {} },
      {
        $project: {
          _id: 0,
          id: "$_id",
          picture: 1,
          name: 1,
          headquarter: 1,
          contact: 1,
        },
      },
    ]);

    Response(res)
      .status(200)
      .message("All organisations")
      .body({ organisations })
      .send();
  };

  //@desc get all organisations
  //@route GET /api/organisation/names
  //@access private (SuperAdmin)
  getAllOrganisationNames = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const organisations = await OrganisationService.aggregate([
      { $match: {} },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);

    const organisationNames = organisations.map((item) => {
      return { id: item._id, name: item.name };
    });

    Response(res)
      .status(200)
      .message("All organisations")
      .body({ organisationNames })
      .send();
  };

  //@desc get organisation
  //@route GET /api/organisation/:organisationId
  //@access private (SuperAdmin)
  getOrganisation = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const organisationId = req.params.organisationId;
    const organisation = await OrganisationService.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(organisationId) } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          picture: 1,
          name: 1,
          headquarter: 1,
          contact: 1,
        },
      },
    ]);

    const organisationFound = organisation[0];

    if (!organisationFound) {
      throw new HttpError(404, "Organisation not found");
    }

    Response(res)
      .status(200)
      .message("Organisation found")
      .body({ organisation: organisationFound })
      .send();
  };

  //@desc update organisation by organisationId
  //@route PUT /api/organisation/:organisationId
  //@access private
  updateOrganisation = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const organisationId = req.params.organisationId;

    const updates = req.body;

    const organisation = await OrganisationService.findByIdAndUpdate(
      organisationId,
      { ...updates },
      { new: true }
    );

    if (!organisation) {
      throw new HttpError(404, "Organisation not found");
    }

    Response(res)
      .status(200)
      .message("Organisation Updated")
      .body({ organisation })
      .send();
  };

  //@desc delete organisation by organisationId
  //@route DELETE /api/organisation/:organisationId
  //@access private
  deleteOrganisation = async (req, res) => {
    Logger.info(`Request received: ${req.method} ${req.url}`);

    const organisationId = req.params.organisationId;

    const organisation = await OrganisationService.findByIdAndDelete(
      organisationId
    );

    if (!organisation) {
      throw new HttpError(404, "Organisation not found");
    }

    Response(res)
      .status(200)
      .message("Organisation Deleted")
      .body({ organisation })
      .send();
  };
}

module.exports.OrganisationController = new OrganisationController();
