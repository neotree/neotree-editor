module.exports = app => (req, res, next) => { // eslint-disable-line
  if (req.isAuthenticated()) {
    app.logger.log('getAuthenticatedUserMiddleware');
    return app.pool.query(
      'SELECT * from user_profiles WHERE "user_id"=$1',
      [req.user.id],
      (error, rslts) => {
        if (error) return res.locals.setResponse(error);
        res.locals.setResponse(null, {
          authenticatedUser: rslts.rows[0]
        });
        next();
      }
    );
  }
  res.locals.setResponse(null, { authenticatedUser: null });
  next();
};
