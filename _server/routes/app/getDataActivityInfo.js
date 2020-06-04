import { Script, Screen } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Promise.all([
    Script.count({ where: { ...payload } }),
    Script.findAll({ where: { ...payload }, attributes: ['createdAt'], limit: 1, order: [['createdAt', 'DESC']] }),
    Script.findAll({ where: { ...payload }, attributes: ['updatedAt'], limit: 1, order: [['updatedAt', 'DESC']] }),

    Screen.count({ where: { ...payload } }),
    Screen.findAll({ where: { ...payload }, attributes: ['createdAt'], limit: 1, order: [['createdAt', 'DESC']] }),
    Screen.findAll({ where: { ...payload }, attributes: ['updatedAt'], limit: 1, order: [['updatedAt', 'DESC']] }),
  ])
    .then((rslts = []) => {
      done(null, {
        scripts: {
          count: rslts[0],
          lastCreatedDate: rslts[1] && rslts[1][0] ? rslts[1][0].createdAt : null,
          lastUpdatedDate: rslts[2] && rslts[2][0] ? rslts[2][0].updatedAt : null,
        },
        screens: {
          count: rslts[3],
          lastCreatedDate: rslts[4] && rslts[4][0] ? rslts[4][0].createdAt : null,
          lastUpdatedDate: rslts[5] && rslts[5][0] ? rslts[5][0].updatedAt : null,
        }
      });
    })
    .catch(done);
};
