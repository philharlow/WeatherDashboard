const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    plugins: [
		new Dotenv(),
        new CopyWebpackPlugin({
            patterns: [
                { from: "public" }
            ]
        }),
    ]
};
