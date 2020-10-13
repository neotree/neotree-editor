module.exports = (req, res, next) => {
  res.locals.$errors = [];
  res.locals.$warnings = [];
  res.locals.$data = null;

  res.locals.setResponse = (err, data, warning) => {
    if (err) {
      res.locals.$errors = [...res.locals.$errors, ...(err && err.map ? err : [err])];
    }

    if (warning) {
      res.locals.$warnings = [...res.locals.$warnings, ...(warning && warning.map ? warning : [warning])];
    }

    if (data) res.locals.$data = { ...res.locals.$data, ...data, };
  };

  res.locals.getResponse = () => ({
    ...res.locals.$data,

    ...res.locals.$errors.length ?
      { errors: res.locals.$errors } : {},

    ...res.locals.$warnings.length ?
      { warnings: res.locals.$warnings } : {},
  });

  next();
};
