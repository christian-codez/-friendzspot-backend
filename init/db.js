const mongoose = require('mongoose');
const config = require('config');

module.exports = async function () {
  try {
    const db = config.get('db');
    const connection = await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  } catch (error) {
    console.log(error);
  }

  mongoose.connection.on('error', err => {
    console.log(err);
  });
};
