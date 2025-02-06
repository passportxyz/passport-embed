import path from "path";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createConfig = (target) => ({
  entry: "./src/index.ts",
  mode: "production",
  target: ["web", "es2018"],
  devtool: "source-map",

  output: {
    path: path.resolve(__dirname, `dist/${target}`),
    filename: "index.js",
    library: {
      type: target === "cjs" ? "commonjs2" : "module",
      name: target === "cjs" ? "PassportEmbed" : undefined, // Add UMD name for better compatibility
    },
    clean: true,
    globalObject: "this",
  },
  experiments: {
    outputModule: target === "esm",
  },
  externals: [/^react($|\/)/, "react-dom"],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
    mainFields: ["module", "main"], // Prioritize ES modules when importing this
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: ">0.2%, not dead, last 2 versions, not IE 11",
                  modules: false, // Preserve ES modules
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
              [
                "@babel/preset-react",
                {
                  runtime: "automatic",
                },
              ],
              "@babel/preset-typescript",
            ],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  corejs: 3,
                  helpers: true,
                  regenerator: true,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                namedExport: false,
                localIdentName: "[name]__[local]--[hash:base64:5]_c6dbf459",
              },
              sourceMap: true, // Enable CSS source maps
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "autoprefixer",
                    {
                      grid: true,
                    },
                  ],
                ],
              },
              sourceMap: true, // Enable PostCSS source maps
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console logs
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
        parallel: true,
      }),
    ],
  },
});

export default [createConfig("esm"), createConfig("cjs")];
