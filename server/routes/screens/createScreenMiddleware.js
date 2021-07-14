import firebase from '../../firebase';
import { Screen } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId, ...payload } = req.body;

    const done = (err, screen) => {
      res.locals.setResponse(err, { screen });
      next();
    };

    if (payload.type === 'diagnosis') {
      const countDiagnosisScreens = await Screen.count({ where: { type: 'diagnosis', script_id: scriptId } });
      if (countDiagnosisScreens) done(new Error('A script can only have one screen with type `diagnosis`'));
    }

    let screenId = null;
    try {
      const snap = await firebase.database().ref(`screens/${scriptId}`).push();
      screenId = snap.key;
    } catch (e) { return done(e); }

    let screensCount = 0;
    try {
      screensCount = await Screen.count({ where: { script_id: scriptId, deletedAt: null } });
    } catch (e) { /* Do nothing */ }

    let screen = {
      ...payload,
      screenId,
      scriptId,
      position: screensCount + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try {
      const rslts = await Screen.findOrCreate({
        where: { screen_id: screen.screenId },
        defaults: {
          script_id: scriptId,
          screen_id: screen.screenId,
          position: screen.position,
          type: screen.type,
          data: JSON.stringify(screen),
        }
      });
      if (rslts && rslts[0]) {
        const { data, ...s } = JSON.parse(JSON.stringify(rslts[0]));
        screen = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, screen);
  })();
};
