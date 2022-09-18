import { categorize } from './categorize.js';
import { pathToVarName } from './css.js';
export * from './categorize.js';
export * from './tokens.js';
export * from './css.js';

export const tokens = (obj: Record<string, any>) => {
    const result = Object.assign({}, obj);
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            const scale = categorize(key, value, { scales: {} });
            if (scale) {
                result[key] = `var(${pathToVarName([scale, value].join('-'))})`;
            }
        }
    }
    return result;
}
