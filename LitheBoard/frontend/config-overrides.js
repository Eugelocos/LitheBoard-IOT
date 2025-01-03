const webpack = require("webpack")
const path = require('path');

module.exports = function override(config, env) {
    //do stuff with the webpack config...
    config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
    }
    config.resolve.alias = {
        ...config.resolve.alias,
        '@config': path.resolve(__dirname, 'src/./config/config.json'), // Alias para config.json
        '@components': path.resolve(__dirname, 'src/components'), // Alias para componentes
        '@utils': path.resolve(__dirname, 'src/utils'), // Alias para utilidades
    };
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ]
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })
    // console.log(config.resolve)
    // console.log(config.plugins)

    return config
}