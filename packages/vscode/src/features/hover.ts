import * as vscode from 'vscode';
import type { Scanner, Token } from '../scanner';
import { isMarkupDoc, isSupportedDoc } from '../utils';

export async function addHovers(context: vscode.ExtensionContext, { config, scanner }: { config: any, scanner: Scanner }): Promise<vscode.Disposable> {
    // @ts-expect-error
    const { resolveTokensByScale } = await import('@tokencss/core');
    const scales = await resolveTokensByScale(config);
    const provider = vscode.languages.registerHoverProvider({ scheme: 'file', language: 'astro' }, {
        async provideHover(doc, position, token) {
            if (!isSupportedDoc(doc)) return;
            if (isMarkupDoc(doc)) {
                const ranges = await scanner.getStyleRanges(doc);
                let range: vscode.Range | null = null;
                for (const r of ranges) {
                    if (r.contains(position)) {
                        range = r;
                        break;
                    }
                }
                if (!range) return;
            }
            const range = doc.getWordRangeAtPosition(position, /(--)?[\w\.]+/);
            if (!range) return;
            const word = doc.getText(range);
            const tokens = await scanner.getTokens(doc);
            const match = tokens.find((token) => {
                if (token.value !== word) return;
                const start = new vscode.Position(token.range.start.line - 1, token.range.start.column - 1);
                const end = new vscode.Position(token.range.end.line - 1, token.range.end.column - 1);
                const tokenRange = new vscode.Range(start, end);
                return tokenRange.contains(position);
            });
            if (!match) return;

            return new vscode.Hover(getDescription(match, scales[match.scale][match.value]));
        },
    })

    context.subscriptions.push(provider);
    return provider;
}

const getDescription = (token: Token, rawToken: any): vscode.MarkdownString => {
    const description = new vscode.MarkdownString('');
    const icon = getIconForScale(token.scale);
    description.supportHtml = true;
    description.supportThemeIcons = true;
    description.isTrusted = true;

    const title = [icon, `**${token.scale}**`, token.value, '\n\n'].join(' ');
    description.appendMarkdown(title);

    const { value } = rawToken;
    switch (token.scale) {
        case 'color': {
            const svg = `<svg height="64" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="64" fill="${value}"/></svg>`;
            appendImage(description, svg);
            break;
        }
    }
    
    description.appendCodeblock(`\n${value}`, 'plaintext');
    return description;
}

function appendImage(value: vscode.MarkdownString, svg: string) {
    svg = svg.replace(/[\<\>\\%=#"'\s]/g, (v) => encodeURIComponent(v))
    const src = `data:image/svg+xml,${svg}`;
    value.appendMarkdown(`\n\n<img src="${src}" width="256" height="64" alt="${value}">\n`)
}

const getIconForScale = (scale: string) => {
    switch (scale) {
        case 'space': return `$(symbol-unit)`
        case 'color': return `$(color-mode)`
        case 'font': return `$(text-size)`
        default: return `$(symbol-method)`
    }
}
