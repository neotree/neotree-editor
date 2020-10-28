"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
      maxAge: 365 * 24 * 60 * 60
    } // = 365 days (exp date will be created from ttl opt)

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
      res.locals[req.originalUrl].payload = _objectSpread(_objectSpread({}, res.locals[req.originalUrl].payload), payload);
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
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/_server/middlewares/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();