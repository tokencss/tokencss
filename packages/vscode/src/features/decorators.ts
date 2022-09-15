import * as vscode from 'vscode';
import type { Scanner } from '../scanner';
import { isSupportedDoc } from '../utils';

const DECORATION_TYPE = vscode.window.createTextEditorDecorationType({
	before: {
		contentText: '⬤',
	}
})
const ranges = new Map<string, vscode.Range[]>();
export async function addDecorators(context: vscode.ExtensionContext, { config, scanner }: { config: any, scanner: Scanner }): Promise<vscode.Disposable> {
    async function updateDecorations(doc: vscode.TextDocument) {
        if (!isSupportedDoc(doc)) return;
		// vscode.window.activeTextEditor?.setDecorations(DECORATION_TYPE, []);
		// @ts-expect-error
		const { resolveTokensByScale } = await import('@tokencss/core');
        const tokens = await scanner.getTokens(doc);
		const scales = await resolveTokensByScale(config);
		
		ranges.clear();
		
        for (const token of tokens) {
			if (token.scale !== 'color') continue;
			const color = scales[token.scale][token.value].value;
			const start = new vscode.Position(token.range.start.line - 1, token.range.start.column - 1);
			const end = new vscode.Position(token.range.end.line - 1, token.range.end.column - 1);
			const range = new vscode.Range(start, end);
			if (!ranges.has(color)) ranges.set(color, []);
			ranges.get(color)?.push(range);
        }
		if (vscode.window.activeTextEditor?.document === doc) {
			for (const [color, r] of ranges) {
				vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE, r.map(range => ({ range, renderOptions: { light: { before: { color, margin: '0 4px 0 0' } }, dark: { before: { color, margin: '0 4px 0 0' } }} })))
			}
		}
    }

	if (vscode.window.activeTextEditor) {
		updateDecorations(vscode.window.activeTextEditor.document);
	}

	const subscriptions: vscode.Disposable[] = [];
    subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			updateDecorations(editor.document);
		}
	}, null, context.subscriptions));

	subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        updateDecorations(event.document);
	}, null, context.subscriptions));

    return new vscode.Disposable(() => subscriptions.map(sub => sub.dispose()))
}
