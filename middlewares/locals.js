module.exports = function (req, res, next) {
  res.locals.DOMAIN_NAME = process.env.DOMAIN_NAME;
  next();
};
