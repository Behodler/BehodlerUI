const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
// const image = require('@rollup/plugin-image');
const images = require('rollup-plugin-image-files');
const url = require('@rollup/plugin-url');
const svgr = require('@svgr/rollup').default;

module.exports = {
    rollup(config, options) {
        config.plugins = [
            images(),
            url({include: ['**/*.webp', '**/*.otf']}),
            svgr(),
            postcss({
                plugins: [
                    autoprefixer(),
                    cssnano({
                        preset: 'default',
                    }),
                ],
                inject: false,
                // only write out CSS for the first bundle (avoids pointless extra files):
                extract: !!options.writeMeta,
            }),
            ...config.plugins,
        ]

        return config;
    },
};
