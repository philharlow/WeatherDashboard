const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
    plugins: [
		new Dotenv(),
		new webpack.DefinePlugin({
			'process.env.OPEN_WEATHER_API_KEY': `"${process.env.OPEN_WEATHER_API_KEY}"`,
		}),
        new CopyWebpackPlugin({
            patterns: [
                { from: "public" }
            ]
        }),
    ]
};
