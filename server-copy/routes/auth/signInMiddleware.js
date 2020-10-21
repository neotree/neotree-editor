import { firebase, firebaseAdmin } from '../../database/firebase';

// module.exports = app => (req, res, next) => {
//   app.passport.authenticate('local', (error, user, info) => {
//     if (error) {
//       res.locals.setResponse(error);
//       next(); return null;
//     }
//
//     if (!user) {
//       res.locals.setResponse(info);
//       next(); return null;
//     }
//
//     req.logIn(user, err => {
//       if (err) {
//         res.locals.setResponse(err);
//         next(); return null;
//       }
//
//       res.locals.setResponse(null, { user });
//       next(); return null;
//     });
//   })(req, res, next);
// };

module.exports = () => (req, res, next) => {
  const { password, username } = req.body;

  const done = (err, rslts) => {
    res.locals.setResponse(err, rslts);
    next();
  };

  (async () => {
    let authenticated = null;
    let user = null;

    try {
      await firebase.auth().signInWithEmailAndPassword(username, password);
      authenticated = firebase.auth().currentUser;
    } catch (e) { return done(e); }

    if (authenticated) {
      try {
        user = await new Promise((resolve) => {
          firebaseAdmin.database().ref(`users/${authenticated.uid}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }
    }

    done(null, { user });
  })();
};
