let mix = require('laravel-mix');
const autoprefixer = require('autoprefixer');
const resources = 'resources/';
const publicDir = './';
mix.js('resources/js/app.js', 'js');


mix.webpackConfig({
    externals: {
        jquery: 'jQuery'
    }
});

mix.override((webpackConfig) => {
    webpackConfig.module.rules.forEach((rule) => {
        if (!rule.use) return;
        rule.use.forEach((useEntry) => {
            if (useEntry.loader && useEntry.loader.includes('babel-loader')) {
                useEntry.options.presets = [
                    ['@babel/preset-env', {
                        targets: { browsers: ['defaults'] },
                        useBuiltIns: false,
                        corejs: false
                    }]
                ];
                useEntry.options.plugins = [
                    require.resolve('@babel/plugin-syntax-dynamic-import'),
                    require.resolve('@babel/plugin-proposal-object-rest-spread'),
                    [require.resolve('@babel/plugin-transform-runtime'), {
                        corejs: false,
                        helpers: true,
                        regenerator: false
                    }]
                ];
            }
        });
    });
});

mix.sass('resources/sass/app.scss', 'css', {
    sassOptions: {
        outputStyle: 'expanded'
    }
}).options({
    postCss: [
        autoprefixer({
            overrideBrowserslist: ['last 6 versions'],
            grid: true
        }),
        require('cssnano')()
    ]
});
mix.sass('resources/sass/blog.scss', 'css', {
    sassOptions: {
        outputStyle: 'expanded'
    }
}).options({
    postCss: [
        autoprefixer({
            overrideBrowserslist: ['last 6 versions'],
            grid: true
        }),
        require('cssnano')()
    ]
});


mix.override((webpackConfig) => {
    console.log(JSON.stringify(webpackConfig.module.rules, null, 2));
});