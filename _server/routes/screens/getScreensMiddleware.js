import { Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const {
    filters,
    ...payload
  } = JSON.parse(req.query.payload || {});

  const done = (err, screens) => {
    res.locals.setResponse(err, { screens });
    next(); return null;
  };

  Screen.findAll({ where: payload, order: [['position', 'ASC']], ...filters })
    .then(screens => done(null, screens))
    .catch(done);
};