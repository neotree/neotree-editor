import firebase from '../../firebase';
import { Screen } from '../../database/models';

export const copyScreen = ({ id }) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Required screen "id" is not provided.'));

    (async () => {
      let screenId = null;
      try {
        const snap = await firebase.database().ref('screens').push();
        screenId = snap.key;
      } catch (e) { return reject(e); }

      let screen = null;
      try {
        screen = await Screen.findOne({ where: { id } });
      } catch (e) { /* Do nothing */ }

      if (!screen) return reject(new Error(`Screen with id "${id}" not found`));

      screen = JSON.parse(JSON.stringify(screen));

      let screensCount = 0;
      try {
        screensCount = await Screen.count({ where: {} });
      } catch (e) { /* Do nothing */ }

      delete screen.id;
      screen = {
        ...screen,
        screen_id: screenId,
        position: screensCount + 1,
        data: JSON.stringify({
          ...screen.data,
          screenId,
          position: screensCount + 1,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }),
      };

      let savedScreen = null;
      try {
        savedScreen = await Screen.findOrCreate({ where: { screen_id: screen.screen_id }, defaults: { ...screen } });
      } catch (e) { return reject(e); }

      resolve(savedScreen);
    })();
  });
};

export default () => (req, res, next) => {
  (async () => {
    const { screens } = req.body;

    const done = async (err, rslts = []) => {
      res.locals.setResponse(err, { screens: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(screens.map(s => copyScreen(s)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
