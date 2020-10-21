module.exports = (req, res, next) => {
  res.locals.reqQuery = {};
  if (req.query) {
    res.locals.reqQuery = Object.keys(req.query).reduce((acc, key) => {
      let value = req.query[key];
      try { value = JSON.parse(req.query[key]); } catch (e) { /* DO NOTHING*/ }
      return { ...acc, [key]: value, };
    }, {});
  }
  next();
};
