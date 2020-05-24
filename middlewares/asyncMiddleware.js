module.exports = hanlder => {
  return async (req, res, next) => {
    try {
      await hanlder(req, res);
    } catch (ex) {
      next(ex);
    }
  };
};
