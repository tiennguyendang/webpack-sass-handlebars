const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const HANDLEBARS_EXTENSION = "hbs";
const HANDLEBARS_FILE_NAME_REGEX = /\w+(?=\.hbs)/;

const DIR_PATHS = {
	ROOT: "src",
	get TEMPLATES() {
		return `${this.ROOT}/templates`;
	},
	get PARTIALS() {
		return `${this.TEMPLATES}/partials`;
	},
	get HELPERS() {
		return `${this.TEMPLATES}/helpers`;
	},
	get LAYOUTS() {
		return `${this.TEMPLATES}/layouts`;
	},
	get PAGES() {
		return `${this.TEMPLATES}/pages`;
	},
};

function getPageNames() {
	const pageFiles = fs.readdirSync(DIR_PATHS.PAGES);

	const pageNames = pageFiles.reduce((result, pageFile) => {
		const [pageName] = pageFile.match(HANDLEBARS_FILE_NAME_REGEX);
		return [...result, pageName];
	}, []);

	return pageNames;
}

/** @type { import('webpack').Configuration } */
module.exports = {
	entry: ["./src/scss/main.scss"],
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "[name].[fullhash].js",
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.hbs$/,
				use: [
					{
						loader: "handlebars-loader",
						options: {
							partialDirs: [path.join(__dirname, DIR_PATHS.PARTIALS)],
						},
					},
				],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					"css-loader",
					{
						loader: "sass-loader",
						options: {
							// Prefer `dart-sass`
							implementation: require("sass"),
						},
					},
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin(),
		// Generate html page from handlebar file
		...getPageNames().map((pageName) => {
			const template = `${DIR_PATHS.PAGES}/${pageName}.${HANDLEBARS_EXTENSION}`;
			const outputFileName = `${pageName}.html`;

			const htmlWebpackPluginInstance = new HtmlWebpackPlugin({
				template,
				filename: outputFileName,
			});
			return htmlWebpackPluginInstance;
		}),
	],
};
