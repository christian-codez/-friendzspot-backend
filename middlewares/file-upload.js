const multer = require('multer');

MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
  },
});

// const coverPhotoStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/coverphotos');
//   },
//   filename: (req, file, cb) => {
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
//   },
// });

const fileFilter = (req, file, cb) => {
  //Check if the mime type is on our array
  const isValid = !!MIME_TYPE_MAP[file.mimetype];

  let error = isValid ? null : new Error('Invlaid mime type!');

  cb(error, isValid);
};

const fileUpload = multer({
  limit: 500000,
  storage: profilePhotoStorage,
  fileFilter: fileFilter,
});

const coverPhotoUpload = multer({
  limit: 500000,
  storage: profilePhotoStorage,
  fileFilter: fileFilter,
});

module.exports = { fileUpload, coverPhotoUpload };
