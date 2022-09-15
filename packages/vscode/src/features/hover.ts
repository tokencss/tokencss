import * as vscode from 'vscode';
import type { Scanner } from '../scanner';
import { isMarkupDoc, isSupportedDoc } from '../utils';

export async function addHovers(context: vscode.ExtensionContext, { config, scanner }: { config: any, scanner: Scanner }): Promise<vscode.Disposable> {
    const { resolveTokensByScale } = await import('@tokencss/core');
    const scales = await resolveTokensByScale(config);
    const provider = vscode.languages.registerHoverProvider({ scheme: 'file'}, {
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

            return new vscode.Hover(new vscode.MarkdownString(`${getIconForScale(match.scale)} **${match.scale}** ${match.value}\n\n\`\`\`\n${scales[match.scale][match.value].value}\n\`\`\``, true));
        },
    })

    context.subscriptions.push(provider);
    return provider;
}

const getIconForScale = (scale: string) => {
    switch (scale) {
        case 'space': return `$(symbol-unit)`
        case 'color': return `$(color-mode)`
        case 'font': return `$(text-size)`
        default: return `$(symbol-method)`
    }
}
