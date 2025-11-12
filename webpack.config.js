module.exports = {
  // ...existing config
  module: {
    rules: [
      // Ignore source map warnings for node_modules
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/@antv/
        ],
      },
    ],
  },
};
