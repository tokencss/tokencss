function createESMPlugin(name, filePath) {
    const fn = (...args) => {
        return {
            postcssPlugin: name,
            prepare() {
                let plugin = import(filePath).then(({ default: plugin }) => plugin(...args));
                return new Proxy({
                    async Once(...a) {
                        if (plugin instanceof Promise) {
                            plugin = await plugin;
                        }
                        if (plugin['Once']) {
                            return plugin['Once'](...a)
                        }
                    },
                    AtRule() {},
                    Declaration() {},
                }, {
                    get(target, name) {
                        if (name === 'Once') {
                            return target[name];
                        }
                        return async (...a) => plugin[name](...a);
                    }
                });
            }
        }
    }
    fn.postcss = true;
    return fn;
}

module.exports = createESMPlugin('@tokencss/postcss', './dist/index.js');
module.exports.loadConfig = async (...args) => import('./dist/index.js').then((mod) => mod.loadConfig(...args))
