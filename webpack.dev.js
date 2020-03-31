const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports={
    mode: 'development',
    devtool: 'source-map',
    entry: {
        app: path.resolve(__dirname, '.', 'src/index.js'),
    },
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, '.', 'dist'),
        filename: '[name]-[hash:5].bundle.js',
        chunkFilename:'[name]-[hash:5].chunk.js',
    },
    devServer: {
        contentBase: path.join(__dirname, './dist/'),
        host: '127.0.0.1',
        port: 5831,
        hot: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './test/index.html',
            filename: 'index.html',
            hash: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
            },
        }),
    ],
};
