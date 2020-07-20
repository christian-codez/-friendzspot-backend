var jwt = require('jsonwebtoken');
var { User } = require('../models/user');
const testV = 'this is me';
const generateToken = user => {
  try {
    if (
      !user.email &&
      !user.firstname &&
      !user.lastname &&
      !user._id &&
      !user.password
    )
      return false;
    const userSignature = {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      id: user._id,
      password: user.password,
    };
    const key = process.env.jwtprivatekey || 'yuchatheroku18';
    return jwt.sign(userSignature, key);
  } catch (error) {
    return false;
  }
};

const verifyToken = async token => {
  try {
    const key = process.env.jwtprivatekey || 'yuchatheroku18';
    decoded = jwt.verify(token, key);
    const user = await User.findUser(decoded.id);
    if (!user) throw new Error('Invalid Token');
    return user;
  } catch (error) {
    return error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  testV,
};
