import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from './models/User';

const LocalStrategy = require('passport-local').Strategy;

export default app => {
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, profile: user.profile });
  });

  passport.deserializeUser((id, done) => {
    User.findUser(
      app.db,
      { id },
      'id',
      (err, user) => {
        done(null, user);
      }
    );
  });

  /******************************************************************************
  *****************************LOCAL STRATEGY************************************/
  passport.use(new LocalStrategy((username, password, done) => {
    User.findUser(
      app.db,
      { email: username },
      'id email password',
      (err, user) => {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { type: 'NOT_FOUND', msg: 'Incorrect username or password' });
        }

        if (!user.password) {
          return done(null, false, { type: 'INCORRECT_PASSWORD', msg: 'Incorrect username or password' });
        }

        //Match password
        bcrypt.compare(
          password,
          user.password,
          (err, isMatch) => {
            if (err) return done(err);

            if (isMatch) { return done(null, user); }

            return done(null, false, { type: 'INCORRECT_PASSWORD', msg: 'Incorrect username or password' });
          });
      }
    );
  }));

  //passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.passport = passport;

  return app;
};
