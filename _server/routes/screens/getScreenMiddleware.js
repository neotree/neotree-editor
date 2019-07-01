import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next();
  };

  Screen.findOne({ where: payload })
    .then((screen) => done(null, screen))
    .catch(done);
};
