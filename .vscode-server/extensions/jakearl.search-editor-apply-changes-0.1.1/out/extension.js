"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const pathUtils = require("path");
const FILE_LINE_REGEX = /^(\S.*):$/;
const RESULT_LINE_REGEX = /^(\s+)(\d+)(:| ) (.*)$/;
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('searchEditorApplyChanges.apply', () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const activeDocument = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
        if (!activeDocument || activeDocument.languageId !== 'search-result') {
            return;
        }
        const lines = activeDocument.getText().split('\n');
        let filename;
        let currentDocument;
        let currentTarget;
        const edit = new vscode.WorkspaceEdit();
        let editedFiles = new Set();
        let warnLongLines = false;
        const channel = vscode.window.createOutputChannel("Search Editor");
        for (const line of lines) {
            const fileLine = FILE_LINE_REGEX.exec(line);
            if (fileLine) {
                const [, path] = fileLine;
                currentTarget = relativePathToUri(path, activeDocument.uri);
                currentDocument = currentTarget && (yield vscode.workspace.openTextDocument(currentTarget));
                filename = currentTarget && line;
            }
            if (!currentDocument || !currentTarget || !filename) {
                continue;
            }
            const resultLine = RESULT_LINE_REGEX.exec(line);
            if (resultLine) {
                const [, indentation, _lineNumber, seperator, newLine] = resultLine;
                const lineNumber = +_lineNumber - 1;
                const oldLine = currentDocument.lineAt(lineNumber);
                if (oldLine.range.end.character > 200) {
                    // TODO: #2
                    warnLongLines = true;
                }
                else if (oldLine.text !== newLine) {
                    if (!editedFiles.has(currentTarget.toString())) {
                        editedFiles.add(currentTarget.toString());
                        channel.appendLine(filename);
                    }
                    channel.appendLine(`	${oldLine.text} => ${newLine}`);
                    edit.replace(currentTarget, oldLine.range, newLine);
                }
            }
        }
        if (warnLongLines) {
            vscode.window.showWarningMessage('Changes to lines over 200 charachters in length may have been ignored.');
        }
        vscode.workspace.applyEdit(edit);
        // Hack to get the state clean, as it in some ways is clean, and this reduces friction for SaveAll/etc.
        vscode.commands.executeCommand('cleanSearchEditorState');
    })));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
// From core's builtin search-result extension.
function relativePathToUri(path, resultsUri) {
    if (pathUtils.isAbsolute(path)) {
        return vscode.Uri.file(path);
    }
    if (path.indexOf('~/') === 0) {
        return vscode.Uri.file(pathUtils.join(process.env.HOME, path.slice(2)));
    }
    if (vscode.workspace.workspaceFolders) {
        const multiRootFormattedPath = /^(.*) • (.*)$/.exec(path);
        if (multiRootFormattedPath) {
            const [, workspaceName, workspacePath] = multiRootFormattedPath;
            const folder = vscode.workspace.workspaceFolders.filter(wf => wf.name === workspaceName)[0];
            if (folder) {
                return vscode.Uri.file(pathUtils.join(folder.uri.fsPath, workspacePath));
            }
        }
        else if (vscode.workspace.workspaceFolders.length === 1) {
            return vscode.Uri.file(pathUtils.join(vscode.workspace.workspaceFolders[0].uri.fsPath, path));
        }
        else if (resultsUri.scheme !== 'untitled') {
            // We're in a multi-root workspace, but the path is not multi-root formatted
            // Possibly a saved search from a single root session. Try checking if the search result document's URI is in a current workspace folder.
            const prefixMatch = vscode.workspace.workspaceFolders.filter(wf => resultsUri.toString().startsWith(wf.uri.toString()))[0];
            if (prefixMatch) {
                return vscode.Uri.file(pathUtils.join(prefixMatch.uri.fsPath, path));
            }
        }
    }
    console.error(`Unable to resolve path ${path}`);
    return undefined;
}
//# sourceMappingURL=extension.js.map