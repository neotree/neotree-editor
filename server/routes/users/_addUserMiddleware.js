import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
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
          hospitals: [],
          countries: [],
          activated: false,
        });
      } catch (e) { return done(e); }

      try {
        user = await new Promise((resolve) => {
          firebase.database().ref(`users/${user.uid}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { return done(e); }
    }

    done(null, { user });
  })();
};
