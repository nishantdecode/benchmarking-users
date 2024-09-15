class BasicServices {
  constructor(modal) {
    this.modal = modal;
  }
  create = (body) => {
    return this.modal.create({ ...body });
  };
  exists = (filter) => {
    return this.modal.exists({ ...filter });
  };
  find = (filter) => {
    return this.modal.find({ ...filter });
  };
  findOne = (filter) => {
    return this.modal.findOne({ ...filter });
  };
  findById = (id) => {
    return this.modal.findById(id);
  };
  findByIdAndUpdate = (id, body) => {
    return this.modal.findByIdAndUpdate(id, { ...body });
  };
  findByIdAndDelete = (id) => {
    return this.modal.findByIdAndDelete(id);
  };
  deleteOne = (filter) => {
    return this.modal.deleteOne({ ...filter });
  };
  deleteMany = (filter) => {
    return this.modal.deleteMany({ ...filter });
  };
}

module.exports = BasicServices;
