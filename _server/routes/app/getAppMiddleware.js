import { App } from '../../models';

module.exports = () => (req, res, next) => {
  const done = (err, app = {}) => {
    res.locals.setResponse(err, { app });
    next(); return null;
    return null;
  };
  App.findAll({})
    .then(apps => done(null, apps[0]))
    .catch(done);
};
