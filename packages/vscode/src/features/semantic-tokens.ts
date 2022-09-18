import * as vscode from 'vscode';
import type { Scanner } from '../scanner';
import { isSupportedDoc } from '../utils';

export async function addSemanticTokens(context: vscode.ExtensionContext, { scanner }: { scanner: Scanner }): Promise<vscode.Disposable> {
    const provider = vscode.languages.registerDocumentSemanticTokensProvider({ scheme: 'file', language: 'astro' }, new DocumentSemanticTokensProvider({ scanner }), LEGEND)
	context.subscriptions.push(provider);
    return provider;
}

const TOKEN_TYPES = [
    'token'
]
const TOKEN_TYPES_LEGEND = createLegend(TOKEN_TYPES);
const TOKEN_MODIFIERS = [
    'color',
    'space',
]
const TOKEN_MODIFIERS_LEGEND = createLegend(TOKEN_MODIFIERS);
const LEGEND = new vscode.SemanticTokensLegend(TOKEN_TYPES, TOKEN_MODIFIERS)

function createLegend(arr: string[]) {
    return new Map<string, number>(arr.map((token, index) => ([token, index])));
}

export interface SemanticToken {
	line: number;
	character: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    #scanner: Scanner;
	
    constructor(opts: { scanner: Scanner }) {
        this.#scanner = opts.scanner
	}

	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		const builder = new vscode.SemanticTokensBuilder();
		if (!isSupportedDoc(document)) return builder.build();
        
        const tokens = await this.#scanner.getTokens(document);
		tokens.forEach((token) => {
			const { value, scale, range: { start: { line, column } } } = token;
			builder.push(line - 1, column - 1, value.length, this.#encodeTokenType('token'), this.#encodeTokenModifiers([scale]));
		});
		return builder.build();
	}

    #encodeTokenType(tokenType: string): number {
        return TOKEN_TYPES_LEGEND.get(tokenType) ?? TOKEN_TYPES_LEGEND.size + 2;
    }

    #encodeTokenModifiers(tokenModifiers: string[]): number {
        let result = 0;
		for (let i = 0; i < tokenModifiers.length; i++) {
			const tokenModifier = tokenModifiers[i];
			if (TOKEN_MODIFIERS_LEGEND.has(tokenModifier)) {
				result = result | (1 << TOKEN_MODIFIERS_LEGEND.get(tokenModifier)!);
			} else {
				result = result | (1 << TOKEN_MODIFIERS_LEGEND.size + 2);
			}
		}
		return result;
    }
}
