exports.asyncMiddleware = hanlder => {
  return async (req, res, next) => {
    try {
      await hanlder(req, res);
    } catch (ex) {
      console.log(ex);
      next(ex);
    }
  };
};
