import firebase from '../../firebase';
import { Screen } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { items, targetScriptId: scriptId } = req.body;

    const done = (err, items = []) => {
      res.locals.setResponse(err, { items });
      next();
    };

    let snaps = [];
    try {
      snaps = await Promise.all(items.map(() => firebase.database().ref(`screens/${scriptId}`).push()));
    } catch (e) { return done(e); }

    let screensCount = 0;
    try {
      screensCount = await Screen.count({ where: { script_id: scriptId, deletedAt: null } });
    } catch (e) { /* Do nothing */ }

    let screens = [];
    try {
      screens = await Screen.findAll({ where: { id: items.map(s => s.id) } });
      screens = screens.map((s, i) => {
        s = JSON.parse(JSON.stringify(s));
        delete s.id;
        return {
          ...s,
          screen_id: snaps[i].key,
          script_id: scriptId,
          position: screensCount + 1,
          data: JSON.stringify({
            ...s.data,
            scriptId,
            screenId: snaps[i].key,
            position: screensCount + 1,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
          }),
        };
      });
    } catch (e) { return done(e); }

    try {
      const rslts = await Promise.all(screens.map(screen => {
        return Screen.findOrCreate({ where: { screen_id: screen.screen_id }, defaults: { ...screen } });
      }));
      screens = rslts.map(rslt => {
        const { data, ...screen } = JSON.parse(JSON.stringify(rslt[0]));
        return { ...data, ...screen };
      });
    } catch (e) { /* Do nothing */ }

    done(null, screens);
  })();
};
