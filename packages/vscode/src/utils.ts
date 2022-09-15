import * as vscode from 'vscode';
import path from 'node:path';
import { HTML_EXTENSIONS, STYLE_EXTENSIONS } from "./constants";

export function isSupportedDoc(doc: vscode.TextDocument): boolean {
	return isMarkupDoc(doc) || isStyleDoc(doc);
}

export function isMarkupDoc(doc: vscode.TextDocument): boolean {
	const ext = path.extname(doc.fileName)
	return HTML_EXTENSIONS.has(ext);
}

export function isStyleDoc(doc: vscode.TextDocument): boolean {
	const ext = path.extname(doc.fileName)
	return STYLE_EXTENSIONS.has(ext);
}
