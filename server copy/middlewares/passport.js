import passport from 'passport';
import bcrypt from 'bcryptjs';
import { User } from '../models';

const LocalStrategy = require('passport-local').Strategy;

module.exports = app => {
  passport.serializeUser((user, done) => {
    // data.logger.log('passport.serializeUser');
    done(null, { id: user.id });
    return null;
  });

  passport.deserializeUser((user, done) => {
    // data.logger.log('passport.deserializeUser');
    User.findOne({ where: { id: user.id }, attributes: ['id'] })
      .then(user => { done(null, user); return null; })
      .catch(done);
  });

  /******************************************************************************
  *****************************LOCAL STRATEGY************************************/
  passport.use(new LocalStrategy((username, password, done) => {
    // data.logger.log('new passport.LocalStrategy()');
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