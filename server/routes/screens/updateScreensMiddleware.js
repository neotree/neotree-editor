import { Screen } from '../../models';

export const updateScreens = (screens, returnUpdated = false) => new Promise((resolve, reject) =>
  Promise.all(screens.map(({ id, ...scr }) =>
    Screen.update({ ...scr }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    if (!returnUpdated) return resolve({ rslts });

    Screen.findAll({ where: { id: screens.map(scr => scr.id) }, order: [['position', 'ASC']] })
      .then(screens => resolve({ screens }))
      .catch(reject);

    return null;
  }).catch(reject)
);

export const findAndUpdateScreens = (
  finder = {},
  updater,
  returnUpdated = false
) =>
  new Promise((resolve, reject) => {
    Screen.findAll(finder).then(screens => {
      screens = updater(JSON.parse(JSON.stringify(screens)));
      updateScreens(screens, returnUpdated)
        .then(resolve)
        .catch(reject);
      return null;
    }).catch(reject);
  });

export default (app) => (req, res, next) => {
  const { screens, returnUpdated } = req.body;

  const done = (err, payload) => {
    app.io.emit('update_screens', { screens: screens.map(s => ({ id: s.id })) });
    res.locals.setResponse(err, payload);
    next(); return null;
  };

  updateScreens(screens, returnUpdated)
    .then(payload => done(null, payload))
    .catch(done);
};
