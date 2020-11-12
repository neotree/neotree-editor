import firebase from '../../firebase';
import { Log, Screen } from '../../database/models';

module.exports = app => (req, res, next) => {
  (async () => {
    const { items, targetScriptId: scriptId } = req.body;

    const done = (err, items = []) => {
      if (items.length) {
        app.io.emit('create_screens', { key: app.getRandomString(), screens: items.map(s => ({ screenId: s.id, scriptId: s.scriptId, })) });
        Log.create({
          name: 'create_screens',
          data: JSON.stringify({ screens: items.map(s => ({ screenId: s.id, scriptId: s.scriptId, })) })
        });
      }
      res.locals.setResponse(err, { items });
      next();
    };

    const ids = [];
    try {
      const snaps = await Promise.all(items.map(() => firebase.database().ref(`screens/${scriptId}`).push()));
      snaps.forEach(snap => ids.push(snap.key));
    } catch (e) { return done(e); }

    let screens = [];
    try {
      let _screens = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      _screens = _screens || {};
      screens = Object.keys(_screens).map(key => _screens[key]);
      screens = items.map((s, i) => ({
        ...s,
        ..._screens[s.screenId],
        scriptId,
        position: i + screens.length + 1,
        id: ids[i] || s.id,
        screenId: ids[i] || s.id,
      }));
    } catch (e) { return done(e); }

    try {
      await Promise.all(screens.map(s => {
        return firebase.database().ref(`screens/${scriptId}/${s.screenId}`).set({
          ...s,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      }));
    } catch (e) { return done(e); }

    try {
      await Promise.all(screens.map(screen => {
        return Screen.findOrCreate({
          where: { screen_id: screen.screenId },
          defaults: {
            screen_id: screen.screenId,
            script_id: screen.scriptId,
            type: screen.type,
            position: screen.position,
            data: JSON.stringify(screen),
          }
        });
      }));
    } catch (e) { /* Do nothing */ }

    done(null, screens);
  })();
};
