import passport from 'passport';
import { User } from '../database';
import * as errorCodes from '../../constants/error-codes/auth';

const LocalStrategy = require('passport-local').Strategy;

module.exports = app => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((_id, done) => {
    User.findOne({ where: { id: _id }, attributes: ['id'] })
      .then(user => { done(null, user); return null; })
      .catch(done);
  });

  /******************************************************************************
  **************************** LOCAL STRATEGY ***********************************/
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { email: username } });

      if (!user) return done(new Error(errorCodes.SIGNIN_NO_USER));

      if (!password) return done(new Error(errorCodes.SIGNIN_MISSNG_PASSWORD));

      try {
        const isMatch = await require('bcryptjs').compare(password, user.password);

        if (!isMatch) return done(new Error(errorCodes.SIGNIN_WRONG_PASSWORD));

        done(null, user);
      } catch (e) { done(e); }
    } catch (e) { done(e); }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.passport = passport;

  return app;
};
