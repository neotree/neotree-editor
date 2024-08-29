"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/array-move";
exports.ids = ["vendor-chunks/array-move"];
exports.modules = {

/***/ "(ssr)/./node_modules/array-move/index.js":
/*!******************************************!*\
  !*** ./node_modules/array-move/index.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   arrayMoveImmutable: () => (/* binding */ arrayMoveImmutable),\n/* harmony export */   arrayMoveMutable: () => (/* binding */ arrayMoveMutable)\n/* harmony export */ });\nfunction arrayMoveMutable(array, fromIndex, toIndex) {\n\tconst startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;\n\n\tif (startIndex >= 0 && startIndex < array.length) {\n\t\tconst endIndex = toIndex < 0 ? array.length + toIndex : toIndex;\n\n\t\tconst [item] = array.splice(fromIndex, 1);\n\t\tarray.splice(endIndex, 0, item);\n\t}\n}\n\nfunction arrayMoveImmutable(array, fromIndex, toIndex) {\n\tarray = [...array];\n\tarrayMoveMutable(array, fromIndex, toIndex);\n\treturn array;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYXJyYXktbW92ZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFPO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmVvdHJlZS13ZWJlZGl0b3IvLi9ub2RlX21vZHVsZXMvYXJyYXktbW92ZS9pbmRleC5qcz8zNTJiIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBhcnJheU1vdmVNdXRhYmxlKGFycmF5LCBmcm9tSW5kZXgsIHRvSW5kZXgpIHtcblx0Y29uc3Qgc3RhcnRJbmRleCA9IGZyb21JbmRleCA8IDAgPyBhcnJheS5sZW5ndGggKyBmcm9tSW5kZXggOiBmcm9tSW5kZXg7XG5cblx0aWYgKHN0YXJ0SW5kZXggPj0gMCAmJiBzdGFydEluZGV4IDwgYXJyYXkubGVuZ3RoKSB7XG5cdFx0Y29uc3QgZW5kSW5kZXggPSB0b0luZGV4IDwgMCA/IGFycmF5Lmxlbmd0aCArIHRvSW5kZXggOiB0b0luZGV4O1xuXG5cdFx0Y29uc3QgW2l0ZW1dID0gYXJyYXkuc3BsaWNlKGZyb21JbmRleCwgMSk7XG5cdFx0YXJyYXkuc3BsaWNlKGVuZEluZGV4LCAwLCBpdGVtKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlNb3ZlSW1tdXRhYmxlKGFycmF5LCBmcm9tSW5kZXgsIHRvSW5kZXgpIHtcblx0YXJyYXkgPSBbLi4uYXJyYXldO1xuXHRhcnJheU1vdmVNdXRhYmxlKGFycmF5LCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xuXHRyZXR1cm4gYXJyYXk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/array-move/index.js\n");

/***/ })

};
;