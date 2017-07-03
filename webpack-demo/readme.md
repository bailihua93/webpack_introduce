1. http://www.css88.com/archives/6992

2. http://mlxiao.com/2017/02/08/webpack/#css处理

3. https://github.com/94dreamer/touch-webpack-multiPage  

2. cnpm i --save-dev webpack webpack-dev-server@2  本地化好很多

3. webpack -p  p 标志是 “production”生产模式并且 uglifies（混淆） / minify（压缩） 输出

4. 多文件处理 
您可以通过仅修改 entry 对象来指定任意数量的 entry 或 output 点。 

+ 多个文件，打包在一起
```js
const path = require('path');
const webpack = require('webpack');
module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    app: ['./home.js', './events.js', './vendor.js'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
};
```
+ 多文件多输出  
```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    home: './home.js',
    events: './events.js',
    contact: './contact.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
};
```

+ 自动打包第三方库

如果你把你的应用用程序拆解，打包成多个 output 的话（如果应用的某部分有大量不需要提前加载的 JS 的话，这样做会很有用），在这些文件（通常是第三方库）里就有可能出现重复的代码，因为它将分别解析每个依赖关系。幸运的是，webpack有一个内置的 CommonsChunk 插件来处理这个问题：   
```js
module.exports = {
  // …
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
      minChunks: 2,
    }),
  ],
// …
};
```

现在，在您的 output 文件里，如果你有任何模块被加载2次或更多次（通过 minChunks 设置该值），它就会被打包进一个叫 commons.js 的文件中，然后可以在客户端中缓存这个文件。当然，这将导致一次额外的请求，但是避免了客户端多次下载相同的库。因此，在许多情况下，这是提升速度的举措。

+ 手工打包  
```js
module.exports = {
  entry: {
    index: './index.js',
    vendor: ['react', 'react-dom', 'rxjs'],
  },
  // …
}
```
在这里，你明确告诉 webpack 导出包含 react, react-dom, 和 rxjs Node 模块的vendor 包，而不是依靠 CommonsChunkPlugin自动这些事情。


### 开发  
webpack 实际上有自己的开发服务器，所以无论你是开发一个静态网站还是只是正在原型化前端阶段，这个服务器都是完美可用的。要运行它，只需要在 webpack.config.js 里添加一个 devServer 对象：

```js
 context: path.resolve(__dirname, './src'),
  entry: {
    app: './app.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist/assets'),
    publicPath: '/assets',                          // New
  },
 devServer: {
    contentBase: path.resolve(__dirname, './src'),  // New
  },
```
现在新建一个 src/index.html 文件包含下面这行代码：
```html
<script src="/assets/app.bundle.js"></script>
```
script 标记中的 /assets 对应的是  output.publicPath 的值;因此您可以从任何需要的地方加载资源（如果您使用CDN，则很有用）。webpack 将热替换任何的 JavaScript 更改，因为您无需刷新浏览器。

+ 全局可访问的方法
需要从全局命名空间中使用某些函数？只需在 webpack.config.js 里设置  output.library 即可
```js
module.exports = {
  output: {
    library: 'myClassName',
  }
};
```
这样将他附加到 window.myClassName 实例上。所以使用这种命名作用域，就可以调用 entry 点里面的方法了

## 加载器（Loaders）

处理任何文件类型，只要我们把它传递给 JavaScript 。 我们使用 加载器（Loaders） 来实现。


1. Babel + ES6
cnpm install --dev babel-loader babel-core babel-preset-es2015

```js
module.exports = {
  // …
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: { presets: ['es2015'] },
        }],
      },
    
      // Loaders for other file types can go here
    ],
  },
  // …
};
```

如果你发现一个加载器（Loaders）的 mangling 文件，或其他不应该被处理的文件，您可以指定  exclude 选项以跳过这些文件。在这里，我们将我们的 node_modules 文件夹从 Babel 处理中排除 – 我们不需要它。但我们也可以在我们任何项目文件中应用这个，例如，如果我们有一个  my_legacy_code 文件夹。这不会阻止您加载这些文件；相反，你只是让 webpack知道可以直接导入，不处理它们。你可以使用 include 来包含文件（但通常不需要此选项）。

+ CSS + Style Loader
npm install --save-dev style-loader css-loader
```js
 module: {
+     rules: [
+       {
+         test: /\.css$/,
+         use: [
+           'style-loader',
+           'css-loader'
+         ]
+       }
+     ]
+   }
```
+ sass
npm install sass-loader node-sass webpack --save-dev  

你可能注意到甚至在生产构建的结果中，也把 CSS 打包进了 JavaScript 里面，并且 style-loader 手动地将样式写进了 <head> 中。**乍一看这可能有点奇怪，但当你考虑足够多的时候就会慢慢发现这其实是有道理的。你保存了一个头部请求（在某些连接上节省宝贵的时间），并且如果你用 JavaScript 来加载 DOM，这么做基本上就消除了它自身的无样式闪屏问题。**

还注意到 Webpack 已经通过把所有文件打包成一个从而自动解决了所有的 @import 查询问题（比起依赖 CSS 默认的引入导致不必要的头部请求和缓慢的资源加载，这么做显然更好

从 JS 里加载 CSS 相当爽，因为你可以用一种强有力的新方式去模块化 CSS 代码了。假设你只通过  button.js 加载了 button.css，这就意味着如果 button.js 没有实际用到的话，它的 CSS 也不会打包进我们的生产构建结果。如果你坚持使用像 SMACSS 或者 BEM 那样的面向组件的 CSS，就会知道把 CSS 和 HTML + JavaScript 代码放更近的价值了


+ css+node_module

我们可以在 Webpack 里用 Node 的 ~ 前缀去引入 Node Modules。假设我们提前运行了  yarn add normalize.css，就可以这么用：
```js
@import "~normalize.css";
```

这样就可以全面使用 NPM 来管理第三方样式库（版本及其他）而对我们而言就无需复制粘贴了。更进一步的是，webpack 打包 CSS 比使用默认的 CSS 引入有着显而易见的优势，让客户端远离不必要的头部请求和缓慢的资源加载。



+ css module

只在用 JavaScript 构建 DOM 的时候使用有最佳效果，但本质上来说，它巧妙地将 CSS 在加载它的 JavaScript 里作用域化了（点击这个链接学习更多相关知识）。如果你计划使用它，CSS Modules 对应的 loader 是 css-loader（yarn add --dev css-loader）：



值得注意的是实际上在使用 CSS Modules 引入 Node Modules 的时候可以去掉 ~ 符号（如  @import "normalize.css";）。但是，当 @import 你自己的 CSS 时可能会遇到错误。如果你得到了 “can’t find ___” 这样的错误，尝试添加一个 resolve 对象到 webpack.config.js 里，好让webpack 更好地理解你预期的模块顺序

+ 分开打包 CSS
或许你正在处理**渐进式增强的网站，又或许因为其他的原因你需要一个分离的 CSS 文件**。我们可以简单地实现，只需要在配置里用 extract-text-webpack-plugin 替换掉 style-loader，而无需改变其他任何代码。以 app.js文件为例：

```js
import styles from './assets/stylesheets/application.css';
```
本地安装插件（我们需要这个的测试版本）：

bash 代码:
```js
yarn add --dev extract-text-webpack-plugin@2.0.0-beta.5
```
添加到 webpack.config.js：

JavaScript 代码:
```js
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  // …
 
  module: {
    rules: [
      {
        test: /\.css$/,
        loader:  ExtractTextPlugin.extract({
          loader: 'css-loader?importLoaders=1',
        }),
      },
    
      // …
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].bundle.css',
      allChunks: true,
    }),
  ],
};
```

### 常用插件 
```js

plugins: [
  // npm install --save-dev webpack 压缩js的插件
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    }),

    //通过计算模块出现次数来分配模块。这个经常被使用可以较快地获得模块。这使得模块可以预读，建议这样可以减少总文件大小。
    new webpack.optimize.OccurenceOrderPlugin(),

  ]

```

常用加载器
```js

//npm install --save-dev style-loader css-loader


//npm install --save-dev sass-loader node-sass webpack
//npm install sass-loader node-sass webpack --save-dev
 rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        }]



```
## 94dreamer


### 为什么学webpack  

+ 压缩我们的js文件合并成一个文件,编写模块化的javascript代码，却不需要为把它放进单独的js文件,单个的script标签所引用
+ 在我们的前端代码项目中使用NPM包管理工具
+ 使用ES6/ES7规范书写代码（借助babel）
+ 缩小/优化代码,有助于让我们页面更快地加载的。
+ 编译LESS/SCSS成CSS
+ 使用HMR（Hot Module Replacement/实时的模块监听改变）,每次保存代码的时候，只要他是被引入到该页面那么不需要完整的页面刷    新。这在我们编辑代码时候是非常方便的。
+ 把任何类型的文件放进我们的javascript中,减少其他构建工具的需要，并允许我们用代码的方式修改和使用这些文件。




###设定babel

touch .babelrc   

```
{
"presets":["es2015","stage-0"]
}
```
后面的stage则有stage-0、stage-1、stage-2，这里我一般使用stage-0，因为它代表了绝大多数的标准情况。

npm install --save-dev babel-preset-es2015 babel-preset-stage-0  


npm install --save-dev babel-loader babel-core  
```js
// 为了节省篇幅只贴出`loaders`部分。

// webpack.config.dev.js 和 webpack.config.prod.js
module: {
  loaders: [{
    test: /\.css$/,
    loaders: ['style', 'css']
  }, {
    test: /\.js$/,
    loaders: ['babel'],
    include: path.join(__dirname, 'src')
  }]
}
```
include指定编译哪些文件，loader只会在我们所指定的src目录下匹配.js文件。

exclude:/node_modules/  指定不转化哪些文件



## 多页面触屏开发

1. 使用  
```
npm run watch 监听文件改变,提交时需要停止,并执行 npm run buid 或者 npm run online
npm run build 执行外测环境提交代码，代码会被压缩。
npm run online 执行线上环境提交代码，代码会被压缩。
npm run dev 执行开发环境，然后打开localhost:8080/view/或者执行npm run browser,就可以了。
npm run browser 使用打开dev浏览器。
npm run eslint 使用eslint检查代码。
npm run clean 清空编译文件！！慎用
```

2. 切图  

+ 把除了font-size之外的地方使用的px转换成rem。然后在使用了font-size的地方，通过[data-dpr="2"]和[data-dpr="3"]重置font-size的值。

+ 链家网手机版就遇到了这个问题，采取的方案是：对于地图进行zoom，比例为dpr。scale当时没试过，理论上可以，但是是从中心点开始，需要transform-origin: 0 0 0。还是zoom简单，不用写前缀，一个属性搞定。

+ 可以手动设置一下 viewport 不缩放， 就可以了。但是会有个问题，1px 的线不细了  



+ 发布（基于表的静态资源映射系统）

以前的时间戳控制版本号可以，但是不是最好的选择（如果文件名基于内容而定，而且文件名是唯一的，HTTP 报头会建议在所有可能的地方（CDN，ISP，网络设备，网页浏览器）存储一份该文件的副本。）

配合html-webpack-plugin自动引入 或者是 assets-webpack-plugin ，生成了 assets.json文件让php服务器读取脚本配置文件，吐到smarty模版变量。

优点
配置超长时间的本地缓存 —— 节省带宽，提高性能
采用内容摘要作为缓存更新依据 —— 精确的缓存控制
更资源发布路径实现非覆盖式发布 —— 平滑升级
先发静态 再发布html。
php实现的关键代码是 file_get_contents() 函数
突然想到会有一个问题 assets.json放在php目录下 不能随时提交且绑定host走静态资源
解决办法：

服务器加个url参数 assets=dev ,或者让php服务器判断外测或者线上环境变量，读取 assets.dev.json 的配置，这份配置的脚本不带任何版本号，否则线上默认读取 assets.json。
fidder正则匹配来代理
仍然没解决的问题就是 img图片的md5