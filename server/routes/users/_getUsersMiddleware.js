import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, users) => {
      res.locals.setResponse(err, { users });
      next();
    };

    let users = {};
    try {
      users = await new Promise((resolve) => {
        firebase.database()
          .ref('users')
          .on('value', snap => resolve(snap.val()));
      });
      users = users || {};
    } catch (e) { return done(e); }

    done(
      null,
      Object.keys(users).map(key => users[key])
    );
  })();
};
