const { default: tokencss } = require('@tokencss/postcss');

module.exports = {
    plugins: [
        tokencss()
    ]
}
