import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  Screen.findOne({ where: payload })
    .then(rslts => done(null, rslts ? rslts[1] : null))
    .catch(done);
};
