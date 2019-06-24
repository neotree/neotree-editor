module.exports = app => (req, res, next) => {
  app.passport.authenticate('local', (error, user, info) => {
    if (error) {
      res.locals.setResponse(error);
      return next();
    }

    if (!user) {
      res.locals.setResponse(info);
      return next();
    }

    req.logIn(user, err => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }

      res.locals.setResponse(null, { user });
      next();
    });
  })(req, res, next);
};
