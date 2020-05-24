const status = require('http-status');

module.exports.newError = (message, code) => {
  const error = new Error(message);
  error.status = code;
  return error;
};
