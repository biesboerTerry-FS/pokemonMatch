const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.ts",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "build"),
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		extensions: [".ts", ".js", ".scss", ".css"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.scss$/,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/images/[name][ext]",
				},
			},
			{
				test: /\.(woff|woff2|ttf|eot)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/fonts/[name][ext]",
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
		}),
	],
	devServer: {
		compress: false,
		port: 9000,
		hot: true,
		static: "./build",
		open: true,
	},
	mode: "development",
};
