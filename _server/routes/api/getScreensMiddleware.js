import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const {
    filters,
    ...payload
  } = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Screen.findAll({ where: payload, order: [['position', 'ASC']], ...filters })
    .then(screens => done(null, { screens }))
    .catch(done);
};
