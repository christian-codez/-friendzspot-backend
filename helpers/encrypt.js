const bcrypt = require('bcrypt');

exports.encrypt = async password => {
  //encrypt password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};
