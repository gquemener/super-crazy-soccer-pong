const path = require('path');

const config = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scsp.bundle.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.less/,
                loaders: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                loaders: [
                    'file-loader',
                ]
            }
        ]
    }
};

module.exports = config;
