import type { Token } from './types'

type Tokens = Record<string, Token>;

export function pathToVarName(path: string) {
    return `--${path.replace(/[\. ]/g, '-')}`;
}

export function serializeTokensToCSS(tokens: Tokens) {
    let sheet = ':root {';
    const media = [];
    for (const token of Object.values(tokens)) {
        const key = pathToVarName(token.$path);
        if (token.$scale === 'media') {
            media.push(key);
            sheet += `\n  ${key}: ${token.value};`
            continue;
        };
        const value = serializeToken(token);
        if (value === undefined || value === null) {
            continue;
        }
        if (token.description) {
            sheet += `\n  /* ${token.description} */`;
        }
        sheet += `\n  ${key}: ${value};`;
        if (token.type === 'color') {
            sheet += `\n  ${key}-rgb: ${hexToRGBList(value)};`
        }
    }
    sheet += `\n  --tokencss: 1;`;
    if (media.length > 0) {
        sheet += `\n  --tokencss-media: ${media.map(name => `var(${name})`).join(', ')};`
    }
    sheet += '\n}'
    return sheet;
}

function serializeToken(token: Token) {
    switch (token.type) {
        case 'string': return `"${token.value}"`;
        case 'number': return `${token.value}`;
        case 'null': return '';
        case 'boolean': return `${token.value}`;
        case 'color': return `${token.value}`;
        case 'dimension': return `${token.value}`;
        case 'cubic-bezier': return `cubic-bezier(${(token.value as number[]).join(', ')})`;
        case 'font': return (token.value as string[]).map(value => value.includes(' ') ? `"${value}"` : value).join(', ');
        case 'shadow': {
            if (Array.isArray(token.value)) return token.value.map(shadow => serializeShadow(shadow as any)).join(', ');
            return serializeShadow(token.value as any);
        }
    }
}

function serializeShadow(composite: { 'offset-x': Record<string, any> | string, 'offset-y': Record<string, any> | string, blur: Record<string, any> | string, color: Record<string, any> | string, spread?: Record<string, any> | string, opacity?: Record<string, any> | string }) {
    let result = '';
    for (const key of ['offset-x', 'offset-y', 'blur', 'spread']) {
        const token = composite[key];
        if (token.$path) {
            result += `var(${pathToVarName(token.$path)})`
        } else {
            result += ` ${token}`
        }
    }
    const color = composite['color'];
    result += ` rgba(`;
    if (color.$path) {
        result += `var(${pathToVarName(color.$path)}-rgb)`
    } else {
        result += `${hexToRGBList(color)}`;
    }
    result += ', ';
    const opacity = composite['opacity'] ?? '1';
    if (opacity.$path) {
        result += `var(${pathToVarName(opacity.$path)})`
    } else {
        result += `${opacity}`;
    }

    result += `)`;
    return result.trim();
}

function hexToRGBList(h: string) {
    if (typeof h !== 'string') return;
    h = h.slice(1);
    let r = "0", g = "0", b = "0", a = "1";

    switch (h.length) {
        case 3: {
            r = h[0] + h[0];
            g = h[1] + h[1];
            b = h[2] + h[2];
            break;
        }
        case 4: {
            r = h[0] + h[0];
            g = h[1] + h[1];
            b = h[2] + h[2];
            a = h[3] + h[3];
            break;
        }
        case 6: {
            r = h[0] + h[1];
            g = h[2] + h[3];
            b = h[4] + h[5];
            break;
        }
        case 8: {
            r = h[0] + h[1];
            g = h[2] + h[3];
            b = h[4] + h[5];
            a = h[6] + h[7];
            break;
        }
    }

    if (a !== "1") {
        return [r, g, b, a].map(value => Number.parseInt(value, 16)).join(', ');  
    }

    return [r, g, b].map(value => Number.parseInt(value, 16)).join(', ');
}
