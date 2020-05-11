"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = function _default(app) {
  app = (process.env.NODE_ENV === 'production' ? require('./middlewares.production') : require('./middlewares.development'))(app); //body-parser

  app.use(require('body-parser').json());
  app.use(require('body-parser').urlencoded({
    extended: false
  })); //express validator

  app.use(require('express-validator')({
    errorFormatter: function errorFormatter(param, msg, value) {
      var namespace = param.split('.');
      var root = namespace.shift();
      var formParam = root;

      while (namespace.length) {
        formParam += "[".concat(namespace.shift(), "]");
      }

      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })); //express session

  var session = require('express-session');

  var SequelizeStore = require('connect-session-sequelize')(session.Store);

  var sessStore = new SequelizeStore({
    db: app.sequelize
  });
  app.use(session({
    secret: 'neotree',
    saveUninitialized: false,
    // don't create session until something stored
    resave: false,
    //don't save session if unmodified
    store: sessStore,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 // = 365 days (exp date will be created from ttl opt)

    }
  }));
  sessStore.sync();
  app = require('./passport')(app);
  app.use(function (req, res, next) {
    res.locals[req.originalUrl] = {
      payload: {}
    };

    res.locals.setResponse = function (error) {
      var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (error) res.locals[req.originalUrl][error.map ? 'errors' : 'error'] = error;
      res.locals[req.originalUrl].payload = (0, _objectSpread2["default"])({}, res.locals[req.originalUrl].payload, {}, payload);
    };

    res.locals.getResponse = function () {
      return res.locals[req.originalUrl];
    };

    res.locals.getResponsePayload = function () {
      return res.locals[req.originalUrl].payload;
    };

    res.locals.getResponseError = function () {
      return res.locals[req.originalUrl].error || res.locals[req.originalUrl].errors;
    };

    next();
  });

  app.responseMiddleware = function (req, res) {
    var response = res.locals.getResponse();
    if (response.error || response.errors) console.log(response.error || response.errors);
    res.json(response);
  };

  app = require('../routes')(app);
  return app;
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/lamyfarai/Workbench/neotree-editor/_server/middlewares/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();