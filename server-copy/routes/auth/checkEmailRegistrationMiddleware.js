// import { User } from '../../database';
import firebase from '../../database/firebase';

// module.exports = () => (req, res, next) => {
//   const { email } = req.query;
//
//   const done = ((err, payload) => {
//     res.locals.setResponse(err, err ? null : payload);
//     next();
//   });
//
//   User.findOne({ where: { email } })
//     .catch(done)
//     .then(u => done(
//       u ? null : { msg: 'Email address not registered.' },
//       !u ? null : { activated: u.password ? true : false, userId: u.id, email: u.email },
//     ));
// };

module.exports = () => (req, res, next) => {
  const { email } = req.query;

  const done = ((err, payload) => {
    res.locals.setResponse(err, err ? null : payload);
    next();
  });

  (async () => {
    let user = null;
    try { user = await firebase.auth().getUserByEmail(email); } catch (e) { return done(e); }

    if (!user) return done('Email address not registered');

    let userDetails = null;
    try {
      userDetails = await new Promise((resolve) => {
        firebase.database().ref(`users/${user.uid}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    done(null, {
      email,
      userId: user.uid,
      activated: userDetails ? !!userDetails.activated : false,
    });
  })();
};
