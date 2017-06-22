module.exports = {
    entry: "./public/app/app.jsx",
    output:{
        path: "public",
        filename: "bundle.js"
    },
    resolve:{
        extensions: [ "", ".js", ".jsx" ]
    },
    module:{
        loaders:[
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: [ "babel-loader" ],
                query:{
                    presets:[ "es2015", "react" ]
                }
            }
        ]
    },

    watch: true,
    watchOptions: {
        aggregateTimeout: 100
    }
};