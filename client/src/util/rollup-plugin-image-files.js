'use strict';

var fs = require('fs');
var path = require('path');
var rollupPluginutils = require('rollup-pluginutils');

const defaultExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

function image(options = {}) {
    const extensions = options.extensions || defaultExtensions;
    const includes = extensions.map(e => `**/*${e}`);
    const filter = rollupPluginutils.createFilter(options.include || includes, options.exclude);
    let images = [];

    function generateBundle(options, rendered) {
        const dir = options.dir || path.dirname(options.dest || options.file);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        images.forEach(id => {
            fs.writeFileSync(`${dir}/${path.basename(id)}`, fs.readFileSync(id));
        });
    }

    return {
        name: 'image-file',
        load(id) {
            if ('string' !== typeof id || !filter(id)) {
                return null;
            }

            if (images.indexOf(id) < 0) {
                images.push(id);
            }
            return `const img = require('./${path.basename(id)}').default; export default img;`;
        },
        generateBundle,
        ongenerate: generateBundle
    };
}

module.exports = image;