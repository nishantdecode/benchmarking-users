const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



module.exports.singleFileUploadMiddleware = (key) => upload.single(key);
module.exports.multipleFileUploadMiddleware = (key) => upload.array(key,1000000);