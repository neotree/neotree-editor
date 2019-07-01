import { App } from '../../models';

module.exports = () => (req, res, next) => {
  const done = (err, app = {}) => {
    res.locals.setResponse(err, { app });
    next();
  };
  App.findAll({})
    .then(apps => done(null, apps[0]))
    .catch(done);
};
