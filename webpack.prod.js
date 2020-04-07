const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const path = require('path');
module.exports = {
    mode: 'production',
    // mode: 'development',
    // devtool: 'source-map',
    entry: {
        app: path.resolve(__dirname, '.', 'src/index.js'),
    },
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, '.', 'dist'),
        filename: 'flex.polyfill.min.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
    ],
};
