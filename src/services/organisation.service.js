const { Organisation } = require("../models/organisation.model");
const BasicServices = require("./basic.service");

class OrganisationService extends BasicServices {
  constructor() {
    super(Organisation);
  }
  aggregate = (pipeline) => {
    return this.modal.aggregate(pipeline);
  };
}

module.exports.OrganisationService = new OrganisationService();
