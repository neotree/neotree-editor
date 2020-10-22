import firebase from '../../firebase';

export const addUser = params => new Promise((resolve, reject) => {
  (async () => {
    const { email, userId, } = params;

    if (!email) return reject(new Error('Required user "email" is not provided.'));

    let user = null;
    if (userId) {
      try { user = await firebase.auth().getUser(userId); } catch (e) { return reject(e); }
    } else {
      try { user = await firebase.auth().createUser(params); } catch (e) { return reject(e); }
    }

    if (user) {
      try {
        await firebase.database().ref(`users/${user.uid}`).set({
          email,
          id: user.uid,
          userId: user.uid,
          hospitals: [],
          countries: [],
          activated: false,
          ...params,
        });
      } catch (e) { return reject(e); }

      try {
        user = await new Promise((resolve) => {
          firebase.database().ref(`users/${user.uid}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { return reject(e); }
    }

    resolve(user);
  })();
});

export default () => (req, res, next) => {
  const { email, ...params } = req.body;

  const done = (err, user) => {
    res.locals.setResponse(err, { user });
    next();
  };

  if (!email) return done({ msg: 'Required user "email" is not provided.' });

  (async () => {
    let user = null;
    try {
      user = await firebase.auth().createUser({ email, ...params, });
    } catch (e) { return done(e); }

    if (user) {
      try {
        await firebase.database().ref(`users/${user.uid}`).set({
          email,
          id: user.uid,
          userId: user.uid,
          hospitals: [],
          countries: [],
          activated: false,
          ...params
        });
      } catch (e) { return done(e); }

      try {
        user = await new Promise((resolve) => {
          firebase.database().ref(`users/${user.uid}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { return done(e); }
    }

    done(null, user);
  })();
};
