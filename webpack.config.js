const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');


const base = {
  devServer: {
      contentBase: false,
      host: '0.0.0.0',
      port: process.env.PORT || 8362
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      loader: 'babel-loader',
        exclude: function (modulePath) {
            if (/node_modules[\\/]scratch-[^\\/]+[\\/]src/.test(modulePath)) {
                return false;
            }
        },
      include: path.resolve(__dirname, 'src'),
      query: {
        presets: ['es2015']
      }
    }]
  },
  plugins: process.env.NODE_ENV === 'production' ? [
      new webpack.optimize.UglifyJsPlugin({
          include: /\.min\.js$/,
          minimize: true
      })
  ] : []
};

module.exports = [
    Object.assign({}, base, {
        target: 'web',
        entry: {
            'scratch-block-test': './src/scratch-block-test.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js'
        },
        plugins: base.plugins.concat([
            new CopyWebpackPlugin([
                {
                    from: 'src'
                }
            ])
        ])
    }),
];
