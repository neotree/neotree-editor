import { Screen } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, screen) => {
      if (err) app.logger.log(err);
      if (screen) app.io.emit('create_screens', { key: app.getRandomString(), screens: [{ id: screen.id }] });
      res.locals.setResponse(err, { screen });
      next(); return null;
    };

    let position = 0;
    try { 
      position = await Screen.count({ where: { script_id: payload.script_id } }); 
      position++;
    } catch (e) { return done(e); }

    const saveToFirebase = () => new Promise((resolve, reject) => {
      firebase.database().ref(`screens/${payload.script_id}`).push().then(snap => {
        const { data, ...rest } = payload;

        const screenId = snap.key;

        const _data = data ? JSON.parse(data) : null;

        firebase.database()
          .ref(`screens/${payload.script_id}/${screenId}`).set({
            ...rest,
            ..._data,
            position,
            screenId,
            scriptId: payload.script_id,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          }).then(() => {
            resolve(screenId);
          })
          .catch(reject);
      })
      .catch(reject);
    });

    try { 
      const screen_id = await saveToFirebase();
      Screen.create({ ...payload, position, screen_id })
          .then((screen) => done(null, screen))
          .catch(done);
    } catch (e) { done(e); }
  })();
};
