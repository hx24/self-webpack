const less = require('less')

module.exports = function (source) {
  let css = ''
  less.render(source, function (err, output) {
    css = output.css // 这里同步，并不是异步，所以赋值返回就行了
  })

  // 最后编译结果是 eval(`.....`)的形式 \n是转义字符，有问题，转成字符串\n  所以在replace一下
  css = css.replace(/\n/g, '\\n')
  return css
}
