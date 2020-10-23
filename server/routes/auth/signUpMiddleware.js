import { firebase, firebaseAdmin } from '../../firebase';
import { User } from '../../database/models';

// module.exports = (app, payload, callback) => (req, res, next) => {
//   const {
//     loginOnSignUp,
//     password2, // eslint-disable-line
//     ...params
//   } = { ...(payload || req.body) };
//
//   const done = callback || ((err, rslts) => {
//     res.locals.setResponse(err, rslts);
//     next(); return null;
//   });
//
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) done(errors.array());
//
//   require('../../utils/addOrUpdateUser')(params)
//     .then(user => {
//       if (!user) return done({ msg: 'Something went wrong' });
//
//       if (loginOnSignUp === false) return done(null, user);
//
//       req.logIn(user, err => {
//         if (err) done(err);
//
//         done(null, { user });
//       });
//     }).catch(done);
// };

module.exports = (app, payload, callback) => (req, res, next) => {
  const {
    loginOnSignUp,
    password,
    username,
  } = { ...(payload || req.body) };

  const done = callback || ((err, rslts) => {
    res.locals.setResponse(err, rslts);
    next();
  });

  (async () => {
    let user = null;
    try { user = await firebaseAdmin.auth().getUserByEmail(username); } catch (e) { return done(e); }

    if (!user) return done('Email address not registered');

    try {
      await firebaseAdmin.auth().updateUser(user.uid, { password });
    } catch (e) { return done(e); }

    let userDetails = null;
    try {
      userDetails = await new Promise((resolve) => {
        firebaseAdmin.database().ref(`users/${user.uid}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    userDetails = {
      email: username,
      id: user.uid,
      userId: user.uid,
      hospitals: [],
      countries: [],
      ...userDetails,
      activated: true,
    };

    try {
      await firebaseAdmin.database().ref(`users/${user.uid}`).set(userDetails);
    } catch (e) { return done(e); }

    try {
      await User.findOrCreate({
        where: { email: userDetails.email },
        defaults: {
          user_id: userDetails.userId,
          email: userDetails.email,
          data: JSON.stringify(userDetails),
        },
      });
    } catch (e) { /* Do nothing*/ }

    if (loginOnSignUp === false) return done(null, { user: userDetails, });

    let authenticated = null;
    try {
      await firebase.auth().signInWithEmailAndPassword(username, password);
      authenticated = firebase.auth().currentUser;
    } catch (e) { return done(e); }

    done(null, { user: authenticated });
  })();
};
