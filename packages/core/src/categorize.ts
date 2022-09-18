import type { Scale, Token } from './types';

function directional(name: string, alias = name.charAt(0)) {
    return [
        alias,
        `${alias}t`,
        `${alias}r`,
        `${alias}b`,
        `${alias}l`,
        `${alias}x`,
        `${alias}y`,
        name,
        `${name}-top`,
        `${name}-right`,
        `${name}-bottom`,
        `${name}-left`,
        `${name}-inline`,
        `${name}-inline-start`,
        `${name}-inline-end`,
        `${name}-block`,
        `${name}-block-start`,
        `${name}-block-end`,   
    ]
}

const scales: Partial<Record<Scale, string[]>> = {
    color: [
        'bg',
        'color',
        'accent-color',
        'caret-color',
        'column-rule-color',
        'text-decoration-color',
        'text-emphasis-color',
        'outline-color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'border-inline-color',
        'border-inline-start-color',
        'border-inline-end-color',
        'border-block-color',
        'border-block-start-color',
        'border-block-end-color',
    ],
    space: [
        'tx',
        'ty',
        'gap',
        'row-gap',
        'column-gap',
        'grid-gap',
        'grid-row-gap',
        'grid-column-gap',
        ...directional('margin'),
        ...directional('padding'),
        'top',
        'right',
        'bottom',
        'left',
        'inset',
        'inset-block',
        'inset-block-end',
        'inset-block-start',
        'inset-inline',
        'inset-inline-end',
        'inset-inline-start',
    ],
    radius: [
        'br',
        'btlr',
        'btrr',
        'bblr',
        'bbrr',
        'border-radius',
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-left-radius',
        'border-bottom-right-radius'
    ],
    easing: [
        'animation',
        'animation-timing-function',
        'transition',
        'transition-timing-function',
    ],
    font: [
        'f',
        'font',
        'font-family'
    ],
    'font-size': [
        'fs',
        'font-size'
    ],
    'font-weight': [
        'fw',
        'weight',
        'font-weight'
    ],
    'font-leading': [
        'lh',
        'line-height',
        'leading',
    ],
    'font-tracking': [
        'ls',
        'letter-spacing',
        'tracking',
    ]
}

const properties = new Map([
    ['border', ['color', 'border-size', 'space']],
    ['border-inline', ['color', 'border-size', 'space']],
    ['border-inline-start', ['color', 'border-size', 'space']],
    ['border-inline-end', ['color', 'border-size', 'space']],
    ['border-block', ['color', 'border-size', 'space']],
    ['border-block-start', ['color', 'border-size', 'space']],
    ['border-block-end', ['color', 'border-size', 'space']],
    ['background', ['gradient', 'color']],
    ['bg', ['gradient', 'color']],
    ['box-shadow', ['shadow', 'color', 'space']],
    ['shadow', ['shadow', 'color', 'space']],
    ['size', ['size', 'space']],
    ['inline-size', ['size', 'space']],
    ['block-size', ['size', 'space']],
    ['width', ['width', 'size', 'space']],
    ['min-width', ['width', 'size', 'space']],
    ['max-width', ['width', 'size', 'space']],
    ['height', ['height', 'size', 'space']],
    ['min-height', ['height', 'size', 'space']],
    ['max-height', ['height', 'size', 'space']],
]);

export function getTokensForProperty(property: string, ctx: { scales: Partial<Record<Scale, string[]>> }): ([string, Token])[] {
    // normalize custom property declarations
    if (property.charAt(0) === '-' && property.charAt(1) === '-') {
        property = property.slice(2);
    }
    const categories = properties.get(property) ?? [];
    const tokens: [string, Token][] = []
    for (const scale of categories) {
        tokens.push(Object.entries(ctx.scales[scale] ?? {}) as any);
    }
    for (const [scale, props] of Object.entries(scales)) {
        for (const p of props) {
            if (property === p) {
                tokens.push(Object.entries(ctx.scales[scale] ?? {}) as any)
            }
        }
    }
    return tokens.flat(1) as any;
}

const cache = new Map();
export function categorize(property: string, value: string, ctx: { scales: Partial<Record<Scale, string[]>> }): Scale|undefined {
    // ignore custom property values
    if (value.charAt(0) === '-' && value.charAt(1) === '-') {
        return;
    }
    const cacheKey = `${property}:${value}`;
    // normalize custom property declarations
    if (property.charAt(0) === '-' && property.charAt(1) === '-') {
        property = property.slice(2)
    }
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey)
    }
    if (properties.has(property)) {
        const scales = properties.get(property)!;
        for (const [scale, values] of Object.entries(ctx.scales)) {
            if (!scales.includes(scale)) continue;
            if (value in values) {
                cache.set(cacheKey, scale)
                return scale as Scale;
            }
        }
    } else {
        for (const [scale, props] of Object.entries(scales)) {
            for (const p of props) {
                if (property === p) {
                    cache.set(cacheKey, scale)
                    return scale as Scale;
                }
            }
        }
    }
    cache.set(cacheKey, undefined);
}
