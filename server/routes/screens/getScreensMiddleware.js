import { Screen } from '../../database';

module.exports = () => (req, res, next) => {
  const {
    filters,
    ...payload
  } = req.query;

  const done = (err, screens) => {
    res.locals.setResponse(err, { screens });
    next(); return null;
  };

  Screen.findAll({ where: payload, order: [['position', 'ASC']], ...filters })
    .then(screens => done(null, screens))
    .catch(done);
};
