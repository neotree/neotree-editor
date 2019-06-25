import passport from 'passport';
import bcrypt from 'bcryptjs';

const LocalStrategy = require('passport-local').Strategy;

export default app => {
  passport.serializeUser((user, done) => {
    // app.logger.log('passport.serializeUser');
    done(null, { id: user.id });
  });

  passport.deserializeUser((user, done) => {
    // app.logger.log('passport.deserializeUser');
    app.pool.query(
      'SELECT id from users WHERE "id"=$1',
      [user.id],
      (err, rslts) => {
        if (err) {
          return done(err);
        }
        done(null, rslts.rows[0]);
      }
    );
  });

  /******************************************************************************
  *****************************LOCAL STRATEGY************************************/
  passport.use(new LocalStrategy((username, password, done) => {
    // app.logger.log('new passport.LocalStrategy()');
    app.pool.query(
      'SELECT id, "email", "password" from users WHERE "email"=$1',
      [username],
      (err, rslts) => {
        if (err) {
          return done(err);
        }
        const user = rslts.rows[0];
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
