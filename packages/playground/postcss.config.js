const postcssPresetEnv  = require('postcss-preset-env')
const { default: tokencss } = require('@tokencss/postcss');

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
