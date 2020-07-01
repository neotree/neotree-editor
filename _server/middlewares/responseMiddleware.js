module.exports = () => (req, res) => {
  const response = res.locals._response_;

  if (response.errors) console.log(response.errors);

  res.json({
    authenticated: req.isAuthenticated(),
    ...response
  });
};
