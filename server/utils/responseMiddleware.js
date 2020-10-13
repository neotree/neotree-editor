module.exports = (req, res) => {
  const json = res.locals.getResponse();
  
  if (json.errors) {
    console.log('ERRORS', json.errors);
    json.errors = json.errors.map(e => e.msg || e.message || e);
  }

  if (json.warnings) {
    console.log('WARNINGS', json.errors);
    json.errors = json.warnings.map(e => e.msg || e.message || e);
  }
  
  res.json(json);
};
