const postcssPresetEnv  = require('postcss-preset-env')
const tokencss = require('@tokencss/postcss');
console.log(tokencss());

module.exports = {
    plugins: [
        postcssPresetEnv({
            stage: 3,
            features: {
                'nesting-rules': true
            }
        }),
        tokencss()
    ]
}
