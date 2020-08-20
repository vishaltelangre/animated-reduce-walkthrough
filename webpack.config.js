const path = require("path");

module.exports = (env) => {
  return {
    mode: env.NODE_ENV === "production" ? "production" : "development",
    entry: ["@babel/polyfill", "./src/index.js"],
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
    devServer: {
      contentBase: "./dist",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["env"],
            },
          },
        },
      ],
    },
  };
};
