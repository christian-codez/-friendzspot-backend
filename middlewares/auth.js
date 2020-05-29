const helper = require('../helpers/manage-tokens');

async function auth(req, res, next) {
  try {
    const token = req.header('authorization');
    const decodedToken = await helper.verifyToken(token);
    if (typeof decodedToken._id === 'undefined')
      throw new Error('Invalid token or account has not been verified!');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send(error.message);
  }
}

module.exports = auth;
