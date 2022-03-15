import type * as postcss from 'postcss';
import type { Node, WordNode } from 'postcss-value-parser';
import { parse } from 'postcss';
import valueParser from 'postcss-value-parser';
import MagicString from 'magic-string';
import { resolveTokens, resolveTokensByScale, categorize, pathToVarName, serializeTokensToCSS } from '@tokencss/core';
import { loadConfig } from './config.js';

export interface TokenCSSOptions {
    cwd?: string;
    config?: Record<string, any>;
}

interface TokenNode extends WordNode {
    token: string;
}
function findTokens(nodes: Node[], prop: string, scales: any): (WordNode & { token: string })[] {
    const words: TokenNode[] = [];
    function walk(n: Node|Node[], parent?: Node) {
        if (Array.isArray(n)) {
            return n.map(node => walk(node, parent));
        }
        switch (n.type) {
            case 'function': return walk(n.nodes, n);
            case 'word': {
                const scale = categorize(prop, n.value, { scales });
                if (scale && scales[scale]) {
                    const token = scales[scale][n.value];
                    const path = token?.$path;
                    if (path) {
                        let varName = pathToVarName(path);
                        // append -rgb when inside of `rgb` or `rgba`
                        if (parent?.type === 'function' && parent?.value.startsWith('rgb')) {
                            varName += '-rgb';
                        }
                        words.push(Object.assign(n, { token: varName }));
                    }
                }
                return;
            }
        }
    }
    walk(nodes);
    return words;
}

const tokencss: postcss.PluginCreator<TokenCSSOptions> = ({ cwd = process.cwd(), config } = {}) => {
    let promise = config ? null : loadConfig({ cwd });
    let tokens: Record<string, any>|undefined = config ? resolveTokensByScale(config) : undefined;
    let flatTokens = config ? resolveTokens(config) : undefined;

    const plugin: postcss.Plugin = {
        postcssPlugin: '@tokencss/postcss',
        async AtRule(atrule) {
            if (promise && !tokens) {
                await promise.then(value => {
                    tokens = resolveTokensByScale(value);
                    flatTokens = resolveTokens(value);
                });
                promise = null;
            }
            if (atrule.name === 'inject') {
                let params = atrule.params.replace(/^['"]/, '').replace(/['"]$/, '')
                if (!params.startsWith('tokencss:')) return;
                params = params.slice('tokencss:'.length);

                switch (params) {
                    case 'base': {
                        const rules = serializeTokensToCSS(flatTokens);
                        const { nodes } = parse(rules.trim());
                        atrule.replaceWith(...nodes)
                        return;
                    }
                    case 'container': {
                        const screens = Object.values(tokens.media).filter(({ value }: any) => value.includes('(min-width:')).map(({ value }: any) => value);
                        let result = '';
                        result += `\n.container {`;
                        result += `\n  width: calc(100% - calc(var(--container-margin-inline, 0.75rem) * 2));`;
                        result += `\n  max-width: calc(var(--container-max-width, 100%) - calc(var(--container-margin-inline, 0.75rem) * 2));`;
                        result += `\n  padding-right: var(--container-padding-inline, 0);`;
                        result += `\n  padding-left: var(--container-padding-inline, 0);`;
                        result += `\n  margin-right: auto;`;
                        result += `\n  margin-left: auto;`;
                        result += `\n}`;
                        for (const screen of screens) {
                            const width = screen.replace(/^.*\(min-width:\s*/, '').replace(/\)\s*$/, '');
                            result += `\n@media ${screen} {`;
                            result += `\n  :root { --container-max-width: ${width}; }`;
                            result += `\n}`;
                        }
                        const { nodes } = parse(result.trim());
                        atrule.replaceWith(...nodes);
                        return;
                    }
                }
                return;
            }
            if (atrule.name === 'media') {
                if (!tokens.media) return;
                let params = atrule.params;
                if (!(params.startsWith('(') && params.endsWith(')'))) return;
                params = params.slice(1, -1);
                if (!tokens.media[params]) return;
                atrule.assign({ params: tokens.media[params].value });
            }
        },
        async Declaration(decl) {
            if (promise && !tokens) {
                await promise.then(value => {
                    tokens = resolveTokensByScale(value);
                    flatTokens = resolveTokens(value);
                });
                promise = null;
            }
            const { prop, value } = decl;
            const { nodes } = valueParser(value);
            const s = new MagicString(value);

            const tokenNodes = findTokens(nodes, prop, tokens);
            for (const t of tokenNodes) {
                s.overwrite(t.sourceIndex, t.sourceEndIndex, `var(${t.token})`);
                // TODO: add sourcemap to `result.map`
            }
            decl.assign({ value: s.toString() });
        }
    }
    return plugin;
}
tokencss.postcss = true;

export default tokencss;
