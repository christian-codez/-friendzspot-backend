var jwt = require('jsonwebtoken');
var { User } = require('../models/user');

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
    const key = process.env.jwtprivatekey || 'jwtfriendzspotkey';
    //return jwt.sign(userSignature, key, { expiresIn: '48hr' });
    return jwt.sign(userSignature, key);
  } catch (error) {
    return false;
  }
};

const verifyToken = async token => {
  try {
    const key = process.env.jwtprivatekey || 'jwtfriendzspotkey';
    decoded = jwt.verify(token, key);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) throw new Error('Invalid Token');
    return user;
  } catch (error) {
    return error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
