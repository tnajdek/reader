const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function generateReaderConfig(build) {
	let config = {
		name: build,
		mode: build === 'dev' ? 'development' : 'production',
		devtool: build === 'zotero' ? false : 'source-map',
		entry: {
			reader: [
				'./src/index.' + build + '.js',
				'./src/common/stylesheets/main.scss'
			]
		},
		output: {
			path: path.resolve(__dirname, './build/' + build),
			filename: 'reader.js',
			libraryTarget: 'umd',
			publicPath: '',
			library: {
				name: 'reader',
				type: 'umd',
				umdNamedDefine: true,
			},
		},
		optimization: {
			minimize: true,
			minimizer: [new CssMinimizerPlugin()],
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [['@babel/preset-env', { useBuiltIns: "usage", corejs: { version: "3.37" } }]],
							plugins: ["@babel/plugin-transform-modules-commonjs"]
						},
					},
				},
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: 'ts-loader',
				},
				{
					test: /\.s?css$/,
					exclude: path.resolve(__dirname, './src/dom'),
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
						},
						{
							loader: 'postcss-loader',
						},
						{
							loader: 'sass-loader',
							options: {
								additionalData: `$platform: '${build}';`
							}
						},
					],
				},
				{
					test: /\.scss$/,
					include: path.resolve(__dirname, './src/dom'),
					use: [
						{
							loader: 'raw-loader',
						},
						{
							loader: 'sass-loader',
							options: {
								additionalData: `$platform: '${build}';`
							}
						}
					]
				},
				{
					test: /\.svg$/i,
					issuer: /\.[jt]sx?$/,
					use: ['@svgr/webpack'],
				},
			],
		},
		resolve: {
			extensions: ['.js', '.ts', '.tsx']
		},
		plugins: [
			new CleanWebpackPlugin({
				cleanOnceBeforeBuildPatterns: ['**/*', '!pdf/**']
			}),
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
			new HtmlWebpackPlugin({
				template: './index.reader.html',
				filename: './[name].html',
				templateParameters: {
					build
				},
			}),
		],
	};

	if (build === 'zotero') {
		config.externals = {
			react: 'React',
			'react-dom': 'ReactDOM',
			'react-intl': 'ReactIntl',
			'prop-types': 'PropTypes'
		};
	}
	else if (build === 'dev') {
		config.plugins.push(
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'demo/epub/demo.epub', to: './' },
					{ from: 'demo/pdf/demo.pdf', to: './' },
					{ from: 'demo/snapshot/demo.html', to: './' }
				],
				options: {

				}
			})
		);
		config.devServer = {
			static: {
				directory: path.resolve(__dirname, 'build/'),
				watch: true,
			},
			devMiddleware: {
				writeToDisk: true,
			},
			open: '/dev/reader.html?type=pdf',
			port: 3000,
		};
	}

	return config;
}

function generateViewConfig(build) {
	let config = {
		name: build,
		mode: build === 'view-dev' ? 'development' : 'production',
		devtool: 'source-map',
		entry: {
			view: ['./src/index.' + build + '.js']
		},
		output: {
			path: path.resolve(__dirname, './build/' + build),
			filename: 'view.js',
			libraryTarget: 'umd',
			publicPath: '',
			library: {
				name: 'view',
				type: 'umd',
				umdNamedDefine: true,
			},
		},
		optimization: {
			minimize: true,
			minimizer: [new CssMinimizerPlugin()],
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [['@babel/preset-env', { useBuiltIns: "usage", corejs: { version: "3.37" } }]],
							plugins: ["@babel/plugin-transform-modules-commonjs"]
						},
					},
				},
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: 'ts-loader',
				},
				{
					test: /\.s?css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
						},
						{
							loader: 'postcss-loader',
						},
						{
							loader: 'sass-loader',
						},
					]
				}
			],
		},
		resolve: {
			extensions: ['.js', '.ts', '.tsx']
		},
		plugins: [
			new CleanWebpackPlugin({
				cleanOnceBeforeBuildPatterns: ['**/*', '!pdf/**']
			}),
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
			new HtmlWebpackPlugin({
				template: './index.view.html',
				filename: './[name].html',
				templateParameters: {
					build
				},
			}),
		],
	};

	if (build === 'view-dev') {
		config.plugins.push(
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'demo/epub/demo.epub', to: './' },
					{ from: 'demo/snapshot/demo.html', to: './' }
				],
				options: {

				}
			})
		);
		config.devServer = {
			static: {
				directory: path.resolve(__dirname, 'build/'),
				watch: true,
			},
			devMiddleware: {
				writeToDisk: true,
			},
			open: '/view-dev/view.html?type=snapshot',
			port: 3001,
		};
	}

	return config;
}

module.exports = [
	generateReaderConfig('zotero'),
	generateReaderConfig('web'),
	generateReaderConfig('dev'),
	generateViewConfig('ios'),
	generateViewConfig('android'),
	generateViewConfig('view-dev'),
];
