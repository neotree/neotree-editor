import passport from 'passport';
import bcrypt from 'bcryptjs';
import { User } from './database';

const LocalStrategy = require('passport-local').Strategy;

module.exports = app => {
  passport.serializeUser((user, done) => {
    // app.logger.log('passport.serializeUser');
    done(null, { email: user.email });
    return null;
  });

  passport.deserializeUser((user, done) => {
    // app.logger.log('passport.deserializeUser');
    User.findOne({ where: { email: user.email }, attributes: ['email'] })
      .then(user => { done(null, user); return null; })
      .catch(done);
  });

  /******************************************************************************
  *****************************LOCAL STRATEGY************************************/
  passport.use(new LocalStrategy((username, password, done) => {
    // app.logger.log('new passport.LocalStrategy()');
    User.findOne({ where: { email: username } })
      .then(user => {
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
      }).catch(err => done(err));
  }));

  //passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.passport = passport;

  return app;
};
