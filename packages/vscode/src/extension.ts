import * as vscode from 'vscode';
// @ts-expect-error
import { loadConfig } from '@tokencss/postcss';
import { Scanner } from './scanner';
import { addSemanticTokens } from './features/semantic-tokens';
import { addCompletionItems } from './features/completion-items';
import { addDecorators } from './features/decorators'
import { addHovers } from './features/hover';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Token CSS activated');
	

	async function init(doc?: vscode.TextDocument) {
		if (doc) {
			let config = await loadConfig({ cwd: doc.fileName });
			let scanner = new Scanner({ config });
			await addSemanticTokens(context, { scanner });
			await addCompletionItems(context, { config, scanner });
			await addDecorators(context, { config, scanner });
			await addHovers(context, { config, scanner });
		}
	}
	const doc = vscode.window.activeTextEditor?.document;
	await init(doc);

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((event) => init(event?.document)));
}
