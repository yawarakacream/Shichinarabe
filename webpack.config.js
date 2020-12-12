module.exports = {
    mode: 'development',
    entry: './src/ts/index.ts',
    output: {
        path: __dirname,
        filename: './src/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}