import * as vscode from 'vscode';
import postcss from 'postcss';
// @ts-expect-error
import safe from 'postcss-safe-parser';
// @ts-expect-error
import env from 'postcss-preset-env';
// @ts-expect-error
import tokencss from '@tokencss/postcss';
// @ts-expect-error
import { parse, walk } from 'ultrahtml';

import { isMarkupDoc, isStyleDoc } from './utils';

export type Token = { scale: string, value: string, range: { start: { line: number, column: number }, end: { line: number, column: number }}};

const TOKEN_CACHE = new WeakMap<any, Map<string, Map<string, Token[]>>>();
const RANGE_CACHE = new Map<string, Map<string, vscode.Range[]>>();

export class Scanner {
    #config: any;

    constructor(opts: { config: any }) {
        this.#config = opts.config;
    }

    public updateConfig(config: any) {
        this.#config = config;
    }

    async getTokens(doc: vscode.TextDocument): Promise<Token[]> {
        if (isMarkupDoc(doc)) return this.#processMarkup(doc);
        if (isStyleDoc(doc)) return this.#processStyle(doc);
        return ([] as Token[]);
    }

    async getStyleRanges(doc: vscode.TextDocument): Promise<vscode.Range[]> {
        await this.#process(doc);
        return RANGE_CACHE.get(doc.fileName)!.get(doc.getText())!;
    }

    async #process(doc: vscode.TextDocument): Promise<void> {
        if (isMarkupDoc(doc)) await this.#processMarkup(doc);
        if (isStyleDoc(doc)) await this.#processStyle(doc);
    }

    async #processMarkup(doc: vscode.TextDocument): Promise<Token[]> {
        const config = this.#config;
        const { fileName } = doc;
        const text = doc.getText();
        const cached = TOKEN_CACHE.get(config)?.get(fileName)?.get(text);
        if (cached) return cached;

        const fileCache = TOKEN_CACHE.get(config) ?? new Map();
        const textCache = fileCache.get(fileName) ?? new Map();
        const rangeTextCache = RANGE_CACHE.get(fileName) ?? new Map();

        const nodes = await parse(text)
        const ranges: vscode.Range[] = [];
        const promises: any[] = [];
        await walk(nodes, (n) => {
            if (n.type === 1 && n.name === 'style') {
                const cssText = (n.children.length > 0) ? n.children[0].value : '';
                const offset = n.loc[0].end;

                const startLines = text.slice(0, offset).split('\n');
                const startLine = startLines.length - 1;
                const startColumn = startLines[startLine].length;

                const childLines = cssText.split('\n'); 
                const endLine = childLines.length - 1;
                const endColumn = childLines[endLine].length;
                
                const start = new vscode.Position(startLine, startColumn);
                const end = new vscode.Position(startLine + endLine, startColumn + endColumn);
                ranges.push(new vscode.Range(start, end));
                promises.push(this.#scanTokens(doc, cssText, { line: startLine, column: startColumn }));
            }
        })
        const tokens = await Promise.all(promises).then(res => res.flat(1));
        
        if (!textCache.has(text)) textCache.set(text, tokens);
        if (!fileCache.has(fileName)) fileCache.set(fileName, textCache);
        if (!TOKEN_CACHE.has(config)) TOKEN_CACHE.set(config, fileCache);
        if (!rangeTextCache.has(text)) rangeTextCache.set(text, ranges);
        RANGE_CACHE.set(fileName, rangeTextCache);
        return tokens;
    }

    async #processStyle(doc: vscode.TextDocument): Promise<Token[]> {
        const text = doc.getText();
        const cached = TOKEN_CACHE.get(this.#config)?.get(doc.fileName)?.get(text);
        if (cached) return cached;
        const fileCache = TOKEN_CACHE.get(this.#config) ?? new Map();
        const textCache = fileCache.get(doc.fileName) ?? new Map();
        
        const tokens = await this.#scanTokens(doc, text);
        if (!textCache.has(text)) textCache.set(text, tokens);
        if (!fileCache.has(doc.fileName)) fileCache.set(doc.fileName, textCache);
        if (!TOKEN_CACHE.has(this.#config)) TOKEN_CACHE.set(this.#config, fileCache);
        return tokens;
    }

    async #scanTokens(doc: vscode.TextDocument, text: string, offset?: { line: number, column: number }): Promise<Token[]> {
        const scanned = new Set<string>();
        const tokens: Token[] = [];
        await postcss([
            env({
                stage: 3,
                features: {
                    'nesting-rules': true
                }
            }),
            tokencss({
                config: this.#config,
                onToken(t: any) {
                    const key = `${t.scale}:${t.value}`;
                    if (scanned.has(key)) return;
                    if (offset) {
                        const { start, end } = t.range;
                        if (start.line === 1) {
                            start.column += offset.column;
                        }
                        start.line += offset.line;
                        end.line += offset.line;
                    }
                    tokens.push(t);
                    scanned.add(key);
                }
            })
        ]).process(text, { parser: safe, from: '' });
        return tokens;
    }
}

