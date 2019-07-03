import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  Screen.create(payload)
    .then((screen) => done(null, screen))
    .catch(done);
};
