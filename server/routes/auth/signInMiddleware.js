module.exports = app => (req, res, next) => {
  app.passport.authenticate('local', (error, user, info) => {
    if (error) {
      res.locals.setResponse(error);
      next(); return null;
    }

    if (!user) {
      res.locals.setResponse(info);
      next(); return null;
    }

    if (req.body.isAdminAuth && (user.role !== 2)) {
        res.locals.setResponse(new Error('Only admin users are allowed to login.'));
        next(); return null;
    }

    req.logIn(user, err => {
      if (err) {
        res.locals.setResponse(err);
        next(); return null;
      }

      res.locals.setResponse(null, { user });
      next();
      return null;
    });
  })(req, res, next);
};
