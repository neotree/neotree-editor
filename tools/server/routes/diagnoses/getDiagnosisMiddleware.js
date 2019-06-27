import Actions from '../../models/actions';

module.exports = app => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  Actions.get(app.pool, 'diagnoses', { where: payload }, (err, rslts) => {
    if (err) {
      res.locals.setResponse(err);
    } else {
      res.locals.setResponse(null, { diagnosis: rslts.rows[0] });
    }
    next();
  });
};
