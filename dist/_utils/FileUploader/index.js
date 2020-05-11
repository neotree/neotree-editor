"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var Upload =
/*#__PURE__*/
function () {
  function Upload(file) {
    var _this = this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, Upload);
    (0, _defineProperty2["default"])(this, "_initRequest", function () {
      var xhr = _this.xhr = new global.XMLHttpRequest();
      xhr.open('POST', _this.url, true);
      xhr.responseType = 'json';
    });
    var url = opts.url,
        metadata = opts.metadata,
        fieldname = opts.fieldname,
        preserveFilename = opts.preserveFilename,
        options = (0, _objectWithoutProperties2["default"])(opts, ["url", "metadata", "fieldname", "preserveFilename"]);
    if (!file) throw new Error('MISSING: file!');
    if (!url) throw new Error('MISSING: url!');
    this.file = file;
    this.fieldname = fieldname || 'file';
    this.options = options;
    this.metadata = metadata || {};
    this.preserveFilename = preserveFilename;
    this.url = url;
  }

  (0, _createClass2["default"])(Upload, [{
    key: "upload",
    value: function upload() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!_this2.file) return reject(new Error('File is required!'));

        var startUploading = function startUploading() {
          _this2._initRequest();

          _this2._initListeners(resolve, reject);

          _this2._sendRequest();
        };

        if (_this2.file.type.match('image')) {
          _this2.readImage(function (err, opts) {
            _this2.metadata = Object.assign({}, _this2.metadata, opts);
            startUploading();
          });
        } else {
          startUploading();
        }
      });
    }
  }, {
    key: "abort",
    value: function abort() {
      if (this.xhr) this.xhr.abort();
    }
  }, {
    key: "_initListeners",
    value: function _initListeners(resolve, reject) {
      var xhr = this.xhr;
      xhr.addEventListener('error', this.options.onError || function () {
        return reject({
          msg: 'Failed to upload',
          status: xhr.status,
          statusText: xhr.statusText
        });
      });
      xhr.addEventListener('abort', this.options.onAbort || function () {
        return reject();
      });
      xhr.addEventListener('progress', this.options.onProgress);
      xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.response);
      });
    }
  }, {
    key: "_sendRequest",
    value: function _sendRequest() {
      var data = new global.FormData();
      data.append(this.fieldname, this.file);
      data.append('metadata', this.metadata);
      data.append('filename', this.preserveFilename ? this.file.name : "".concat((0, _uuidv["default"])(), "-").concat(this.file.name));
      this.xhr.send(data);
    }
  }, {
    key: "readImage",
    value: function readImage(cb) {
      var reader = new global.FileReader();
      reader.onerror = cb;

      reader.onload = function (e) {
        var img = new global.Image();
        img.src = e.target.result;
        img.onerror = cb;

        img.onload = function () {
          return cb(null, {
            width: img.width,
            height: img.height
          });
        };
      };

      reader.readAsDataURL(this.file);
      return;
    }
  }, {
    key: "__reactstandin__regenerateByEval",
    // @ts-ignore
    value: function __reactstandin__regenerateByEval(key, code) {
      // @ts-ignore
      this[key] = eval(code);
    }
  }]);
  return Upload;
}();

exports["default"] = Upload;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Upload, "Upload", "/home/lamyfarai/Workbench/neotree-editor/_utils/FileUploader/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();