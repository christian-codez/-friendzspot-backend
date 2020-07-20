const mongoose = require('mongoose');
const config = require('config');

module.exports = async function () {
  try {
    const db = `mongodb+srv://${process.env.dbpass}:dFKdrOkMzeQoPmy1@friendzspot-ztuc1.mongodb.net/${process.env.dbname}?retryWrites=true&w=majority`;
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
