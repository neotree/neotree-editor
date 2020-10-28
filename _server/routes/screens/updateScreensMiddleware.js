import { Log, Screen } from '../../models';

export const updateScreens = (screens) => new Promise((resolve, reject) =>
  Promise.all(screens.map(({ id, ...scr }) =>
    Screen.update({ ...scr }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    resolve(rslts.map(([, s]) => s[0]));
    return null;
  }).catch(reject)
);

export const findAndUpdateScreens = (
  finder = {},
  updater,
) =>
  new Promise((resolve, reject) => {
    Screen.findAll(finder).then(screens => {
      screens = updater(JSON.parse(JSON.stringify(screens)));
      updateScreens(screens)
        .then(resolve)
        .catch(reject);
      return null;
    }).catch(reject);
  });

export default (app) => (req, res, next) => {
  const { screens } = req.body;

  const done = (err, screens = []) => {
    if (screens.length) {
      const scrns = screens.map(s => ({ screenId: s.screen_id }));
      app.io.emit('update_screens', { screens });
      Log.create({
        name: 'update_screens',
        data: JSON.stringify({ screens: scrns, })
      });
    }
    res.locals.setResponse(err, { screens, });
    next(); return null;
  };

  updateScreens(screens)
    .then(rslts => done(null, rslts))
    .catch(done);
};
