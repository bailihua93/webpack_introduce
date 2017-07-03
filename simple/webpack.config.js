const path = require('path');
const webpack = require('webpack');
module.exports = {
  context: path.resolve(__dirname, './src'), //指定根目录，src
  entry: {
    app: './app.js', //输入目录
  },
  output: { // 输出目录
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          },
        }],
      },
      //sass
      {
         test: /\.css$/,
         use: [
           'style-loader',
           'css-loader'
         ]
       },
      {
        test: /\.scss$/,
        use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }]
      },


      // Loaders for other file types can go here
    ],
  },
  plugins: [
    //如果你有任何模块被加载2次或更多次（通过 minChunks 设置该值），
    //它就会被打包进一个叫 commons.js 的文件中，然后可以在客户端中缓存这个文件。
    //当然，这将导致一次额外的请求，但是避免了客户端多次下载相同的库。
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
      minChunks: 2,
    }),
  ],
  devServer: { // 配置自身的服务器
    contentBase: path.resolve(__dirname, './src'), // New
  },
};