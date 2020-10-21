import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const { items, targetScriptId: scriptId } = req.body;

    const done = (err, items = []) => {
      if (items.length) app.io.emit('create_screens', { key: app.getRandomString(), screens: items.map(s => ({ id: s.id, scriptId: s.scriptId, })) });
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
      screens = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      screens = screens || {};
      screens = Object.keys(screens).map(key => screens[key]);
      screens = items.map((s, i) => ({
        ...s,
        scriptId,
        position: i + screens.length + 1,
        id: ids[i] || s.id,
        screenId: ids[i] || s.id,
      }));
    } catch (e) { return done(e); }

    try {
      await Promise.all(screens.map(s => {
        return firebase.database().ref(`screens/${scriptId}/${s.screenId}`).set(s);
      }));
    } catch (e) { return done(e); }

    done(null, screens);
  })();
};
