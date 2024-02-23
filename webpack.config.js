/* eslint-disable */
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
	mode: 'production',
	entry: './src/server.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	target: 'node',
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'swc-loader',
					options: {
						jsc: {
							parser: {
								syntax: 'typescript'
							}
						}
					}
				}
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					format: {
						comments: false
					}
				},
				extractComments: false
			})
		]
	},

	externals: [nodeExternals()]
}
