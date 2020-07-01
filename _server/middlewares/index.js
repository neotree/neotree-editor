module.exports = app => {
  app.use((req, res, next) => {
    res.locals.$req_start_time = new Date();
    res.locals.$req_key = `${Date.now()}-${Math.random().toString(36).substr(2)}`.toUpperCase();
    next();
  });

  app.use((req, res, next) => {
    res.locals.$logs = [];
    res.locals.pushLog = e => {
      res.locals.$logs = [...res.locals.$logs, e];
    };
    next();
  });

  app.use((req, res, next) => {
    const response = {};
    res.locals._response_ = response;
    res.locals.resetResponse = () => (res.locals._response_ = response);
    res.locals.setResponse = (err, payload) => {
      let errors = res.locals._response_.errors;
      if (err) {
        console.log(err);
        err = err.message || err.msg || err;
        errors = [...errors || [], ...(err.map ? err : [err])];
      }
      res.locals._response_ = { errors, ...res.locals._response_, ...payload };
    };
    next();
  });

  app.responseMiddleware = require('./responseMiddleware')(app);

  app = require('./passport')(app);

  return app;
};
