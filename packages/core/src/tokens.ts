import dlv from 'dlv';
import type { Scale, Token } from './types';

function flatten(obj, path = []) {
  const flattened = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (key === 'value') {
        flattened[path.join('.')] = value
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flatten(value, [...path, key]))
    }
  })
  return flattened
}

export function resolveTokens(tokens: Record<string, any>): Record<string, Token> {
    const result = {};
    const keys = Object.keys(flatten(tokens));
    for (const key of keys) {
        const token = resolveToken(key, tokens);
        if (typeof token.value === 'object') {
            result[token.$path] = token;
        }
        result[token.$path] = token;
    }
    return result;
}

export function resolveTokensByScale(tokens: Record<string, any>): Record<Scale, Record<string, Token>> {
    const result: Record<Scale, Record<string, Token>> = {} as any;
    const keys = Object.keys(flatten(tokens));
    for (const key of keys) {
        const token = resolveToken(key, tokens);
        const name = token.$path.split('.');
        if (token.$scale) {
            let keyed: string;
            if (name[0] === token.$scale) {
                keyed = name.slice(1).join('.');
            } else {
                keyed = name.join('.');
            }
            if (typeof result[token.$scale] === 'object') {
                result[token.$scale][keyed] = token;
            } else {
                result[token.$scale] = {
                    [keyed]: token,
                }
            }
        }
    }
    return result;
}

const scales = new Set([
    'color',
    'shadow',
    'space',
    'size',
    'width',
    'height',
    'radius',
    'font',
    'font-size',
    'font-weight',
    'font-leading',
    'font-tracking',
    'easing',
    'media',
    'unknown'
])

function deriveTokenType(token: Token, tokens: Record<string, any>): Token {
    if (token.type) return token;
    let n = token.$path.split('.')
    while (!token.type) {
        n = n.slice(0, -1);
        if (n.length === 0) break;
        token.type = dlv(tokens, `${n.join('.')}.type`)
    }
    if (token.type) return token;
    switch (typeof token.value) {
        case 'string':
        case 'number':
        case 'boolean': {
            token.type = typeof token.value;
            return token;
        }
        default: {
            if (!token.value) {
                token.type = 'null';
                return token;
            }
            if (Array.isArray(token.value)) {
                token.type = 'array';
                return token;
            }
            token.type = 'object';
            return token;
        }
    }
}

function deriveTokenValueFromCustomType(token: Token, tokens: Record<string, any>): Token {
    const type = resolveToken(token.type.slice(1, -1), tokens);

    function resolveCompositeValue(composite: Record<string, any>) {
        for (const [typekey, typedef] of Object.entries(type.value)) {
            const value = composite[typekey];
            let result = { value };
            Object.assign(result, typedef);
            if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                const alias = resolveToken(value.slice(1, -1), tokens);
                if (alias) {
                    Object.assign(result, alias);
                }
            }
            composite[typekey] = result
        }
        return composite;
    }
    if (Array.isArray(token.value)) {
        token.value = (token.value as any).map((composite: Record<string, any>) => resolveCompositeValue(composite));
    } else {
        token.value = resolveCompositeValue(token.value as any) as any;
    }
    return token;
}

function deriveTokenScale(token: Token, tokens: Record<string, any>): Token {
    if (token.$scale) return token;
    if (token.type && scales.has(token.type)) {
        token.$scale = token.type;
        return token;
    }
    let n = token.$path.split('.')
    if (scales.has(n[0])) {
        token.$scale = n[0];
        return token;
    }
    if (typeof token.extensions === 'object' && token.extensions['com.tokencss.scale']) {
        token.$scale = token.extensions['com.tokencss.scale'];
        return token;
    }
    while (!token.$scale) {
        n = n.slice(0, -1);
        if (n.length === 0) break;
        token.$scale = dlv(tokens, `${n.join('.')}.extensions`)?.['com.tokencss.scale']
    }
    if (!token.$scale) {
        token.$scale = 'unknown';
    }
    return token;
}

function deriveTokenExtensions(token: Token, tokens: Record<string, any>): Token {
    if (token.extensions) return token;
    let n = token.$path.split('.')
    while (!token.extensions) {
        n = n.slice(0, -1);
        if (n.length === 0) break;
        token.extensions = dlv(tokens, `${n.join('.')}.extensions`)
    }
    return token;
}

export function resolveToken(name: string, tokens: Record<string, any>): Token {
    let token = dlv(tokens, name);
    if (!token) return;
    if (!token.$path) {
        token.$path = name;
    }
    if (typeof token.value === 'string' && token.value.startsWith('{') && token.value.endsWith('}')) {
        token = resolveToken(token.value.slice(1, -1), tokens);
        token.$alias = token.$path;
        token.$path = name;
        return token;
    }
    deriveTokenExtensions(token, tokens);
    deriveTokenType(token, tokens);
    if (typeof token.type === 'string' && token.type.startsWith('{') && token.type.endsWith('}')) {
        deriveTokenValueFromCustomType(token, tokens);
    }
    deriveTokenScale(token, tokens);
    return token
}
