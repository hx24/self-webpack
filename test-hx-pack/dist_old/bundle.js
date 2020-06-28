;(function (modules) {
  var installedModules = {}
  // 自己实现了一个require方法：__webpack_require__
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
    })
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)
    module.l = true
    return module.exports
  }

  return __webpack_require__((__webpack_require__.s = './src/index.js'))
})({
  './src/a.js': function (module, exports, __webpack_require__) {
    eval(
      'let b = __webpack_require__(/*! ./base/b */ "./src/base/b.js")\nmodule.exports = \'a\' + b\n\n\n//# sourceURL=webpack:///./src/a.js?'
    )
  },
  './src/base/b.js': function (module, exports) {
    eval("module.exports = 'b'\n\n//# sourceURL=webpack:///./src/base/b.js?")
  },
  './src/index.js': function (module, exports, __webpack_require__) {
    eval(
      'let str = __webpack_require__(/*! ./a */ "./src/a.js")\nconsole.log(str)\n\n\n//# sourceURL=webpack:///./src/index.js?'
    )
  },
})

// 1. 自己实现了一个require方法：__webpack_require__  并且会立即调用这个方法，先加载入口文件
// 2. 自执行函数传入的参数modules是一个对象，这个对象的key就是每个模块的路径，
//    value就是代码块，是一个函数，里面使用eval执行
