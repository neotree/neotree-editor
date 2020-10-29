module.exports = (req, res) => {
  const { payload, errors, error, } = res.locals.getResponse();
  res.json({
    ...payload,
    ...(error ? { error } : null),
    ...(errors ? { errors } : null)
  });
};
