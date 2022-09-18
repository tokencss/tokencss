import * as vscode from 'vscode';
import type { Scanner } from '../scanner';
import { isMarkupDoc, isSupportedDoc } from '../utils';

const TRIGGER_CHARS = ['.', ':', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
export async function addCompletionItems(context: vscode.ExtensionContext, { config, scanner }: { config: any, scanner: Scanner }): Promise<vscode.Disposable> {
    // @ts-expect-error
    const { resolveTokensByScale, getTokensForProperty } = await import('@tokencss/core');
    const scales = await resolveTokensByScale(config);
    const provider = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'astro' }, {
        async provideCompletionItems(doc, position, token, context) {
            const completionItems: vscode.CompletionItem[] = [];
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
                const newRange = new vscode.Range(range.start, position);
                let textToCursor = doc.getText(newRange);
                let decl = '';
                const openBrace = textToCursor.lastIndexOf('{');
                textToCursor = textToCursor.slice(openBrace > -1 ? openBrace + 1 : 0);
                if (textToCursor.includes(';')) {
                    decl = textToCursor.slice(textToCursor.lastIndexOf(';') + 1).trim()
                } else {
                    decl = textToCursor.trim();
                }
                if (!decl.includes(':')) {
                    return;
                }
                const [property, values] = decl.split(':').map(v => v.trim());
                const value = values.split(/\s+/g).pop()!;

                const tokens = getTokensForProperty(property, { scales });
                const unique = new Set();
                for (const [tokenName, token] of tokens) {
                    if (value && !tokenName.startsWith(value)) continue;
                    const key = `${token.$scale}:${tokenName}`;
                    if (!unique.has(key)) {
                        const item = tokenToCompletionItem(tokenName, token, context);
                        if (unique.size === 0) item.preselect = true;
                        completionItems.push(item);
                        unique.add(key);
                    }
                }
            }

            return completionItems;
        },
    }, ...TRIGGER_CHARS)
	context.subscriptions.push(provider);
    return provider;
}

function tokenToCompletionItem(tokenName: string, token: any, context: vscode.CompletionContext): vscode.CompletionItem {
    const completionItem = new vscode.CompletionItem(tokenName, vscode.CompletionItemKind.Constant);
    completionItem.sortText = `000_${tokenName}`;
    if (context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter && context.triggerCharacter === ':') completionItem.insertText = ` ${tokenName};`
    switch (token.$scale) {
        case 'color': {
            completionItem.kind = vscode.CompletionItemKind.Color;
            completionItem.detail = 'Token';
            completionItem.documentation = token.value;
            break;
        }
    }

    return completionItem;
}
