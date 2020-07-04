const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const t = require('@babel/types')
// @babel/traverse是一个ES6 Module的库，所以需要.default
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const ejs = require('ejs')

// babylon 主要就是把源码转换成AST
// @babel/traverse  AST遍历器
// @babel/types
// @babel/generator  将AST转回code

class Compiler {
  constructor(config) {
    this.config = config
    // 需要保存入口文件的路径
    this.entryId
    // 需要保存所有的模块依赖
    this.modules = {}
    this.entry = config.entry // 入口路径
    this.root = process.cwd() // 工作路径  当前命令执行的路径
  }
  /** 获取源文件的源代码 */
  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8')

    // 使用loader处理
    const loaderRules = this.config.module.rules
    let len = loaderRules.length
    while (len > 0) {
      const rule = loaderRules[--len]
      const { test, use } = rule
      let useLen = use.length
      if (test.test(modulePath)) {
        // 被loader匹配到
        while (useLen > 0) {
          const loaderPath = use[--useLen] // 测试工程直接写的loader的绝对路径，所以这里直接用绝对路径找loader
          const loader = require(loaderPath)
          content = loader(content)
        }
      }
    }

    return content
  }
  /**
   *
   * 解析源码
   * 利用AST进行解析，递归处理
   * 1. 将require改为自定义的__webpack_require__方法
   * 2. 将引用模块的路径，改为相对根目录的路径
   * 如 src/index.js中的require('./a.js)
   *   => __webpack_require__('./src/a.js')
   *
   *    a.js中的require('./base/b.js')
   *   => __webpack_require__('./src/base/b.js')
   *
   * @param {string} source 源码
   * @param {string} parentPath 父路径
   */
  parse(source, parentPath) {
    let ast = babylon.parse(source)
    let dependencies = []
    // https://astexplorer.net
    // 输入测试代码以获取想要遍历的类型以及节点对应的值从哪里取
    // 注意上面选上@bebel/parser  否则类型可能对应不上
    traverse(ast, {
      CallExpression(p) {
        let node = p.node
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          let moduleName = node.arguments[0].value // 取到模块的引用名字
          // 没写后缀名时补全后缀名
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js') // 'a.js'
          moduleName = './' + path.join(parentPath, moduleName) // './src/a.js'
          dependencies.push(moduleName)
          node.arguments = [t.stringLiteral(moduleName)]
        }
      },
    })

    let sourceCode = generator(ast).code
    return {
      sourceCode,
      dependencies,
    }
  }
  /**
   * 构建模块
   * @param {string} modulePath 模块路径,绝对路径
   * @param {boolean} isEntry 是否是入口文件
   */
  buildModules(modulePath, isEntry) {
    let source = this.getSource(modulePath)
    // 模块id是文件的相对路径  moduleName = modulePath(绝对路径) - this.root
    // 获取相对路径  在windows下路径是反斜杠 src\a.js 要兼容一下
    let moduleName = './' + path.relative(this.root, modulePath) // relative：取相对路径

    if (isEntry) {
      this.entryId = moduleName // 保存入口的名字
    }

    // 解析源码进行改造，将所有的模块路径改造成相对根目录的路径
    // 返回一个依赖列表，递归做这件事
    let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName))

    // console.log('sourceCode', sourceCode)
    // console.log('dependencies', dependencies)
    // 把相对路径和模块中的内容 对应起来
    this.modules[moduleName] = sourceCode
    // console.log(source, moduleName)

    // 递归遍历完所有的模块
    dependencies.forEach((dep) => {
      // 此处的dep都是相对根目录的路径了，与root(根目录的绝对路径)拼接以获取绝对路径
      this.buildModules(path.join(this.root, dep), false)
    })
  }
  /** 发射文件 */
  emitFile() {
    // 拿到输出到哪个目录下
    let main = path.join(this.config.output.path, this.config.output.filename)
    let templateStr = this.getSource(path.resolve(__dirname, 'main.ejs'))
    let code = ejs.render(templateStr, { entryId: this.entryId, modules: this.modules })
    this.assets = {}
    // 资源中路径对应的代码
    this.assets[main] = code
    fs.writeFileSync(main, code) // TODO
  }
  run() {
    // 执行  并且创建模块的依赖关系
    this.buildModules(path.resolve(this.root, this.entry), true)
    // console.log(this.modules, this.entryId)
    // 发射一个文件  打包后的文件
    this.emitFile()
  }
}

module.exports = Compiler
