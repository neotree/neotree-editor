import Actions from '../../models/actions';

module.exports = app => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  Actions.get(app.pool, 'config_keys', { where: payload }, (err, rslts) => {
    if (err) {
      res.locals.setResponse(err);
    } else {
      res.locals.setResponse(null, { configKeys: rslts.rows });
    }
    next();
  });
};
