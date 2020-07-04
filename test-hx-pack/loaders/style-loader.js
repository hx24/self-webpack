module.exports = function (source) {
  let ret = `
    var style = document.createElement('style')
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style)
  `

  // 这里innerHTML = 后面必须是一行，所以用JSON.stringify将css内容转成一行 将换行符转成了转义字符 \n

  return ret
}
