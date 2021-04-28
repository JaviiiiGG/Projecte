"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Common_1 = require("./Common");
const Rewrap = require('./core/Main');
const Settings_1 = require("./Settings");
/** Handler that's called if the text in the active editor changes */
const checkChange = (e) => {
    // Make sure we're in the active document
    const editor = vscode_1.window.activeTextEditor;
    if (!editor || !e || editor.document !== e.document)
        return;
    const doc = e.document;
    // We only want to trigger on normal typing and input with IME's, not other
    // sorts of edits. With normal typing the range (text insertion point) and
    // selection will be both empty and equal to each other (the selection state
    // is still from *before* the edit). IME's make edits where the range is not
    // empty (as text is replaced), but the selection should still be empty. We
    // can also restrict it to single-line ranges (this filters out in
    // particular undo edits immediately after an auto-wrap).
    if (editor.selections.length != 1)
        return;
    if (!editor.selection.isEmpty)
        return;
    // There's more than one change if there were multiple selections,
    // or a whole line is moved up/down with alt+up/down
    if (e.contentChanges.length != 1)
        return;
    const { text: newText, range, rangeLength } = e.contentChanges[0];
    if (rangeLength > 0)
        return;
    try {
        const file = Common_1.docType(doc);
        const settings = Settings_1.getCoreSettings(editor, cs => Rewrap.getWrappingColumn(file.path, cs));
        // maybeAutoWrap does more checks: that newText isn't empty, but is only
        // whitespace. Don't call this in a promise: it causes timing issues.
        const edit = Rewrap.maybeAutoWrap(file, settings, newText, range.start, Common_1.docLine(doc));
        return Common_1.applyEdit(editor, edit).then(null, Common_1.catchErr);
    }
    catch (err) {
        Common_1.catchErr(err);
    }
};
/** Notification that shows autowrap status in status bar */
var Notification;
(function (Notification) {
    const sbItem = vscode_1.window.createStatusBarItem(0, 101);
    const defaultColor = new vscode_1.ThemeColor('statusBar.foreground');
    let timeout; // Used for the text notification that hides after a few secs
    /** Override must be true or false */
    function maybeShow(settings, override, wasToggled) {
        const hideAfterTimeout = () => { sbItem.hide(); clearTimeout(timeout); };
        hideAfterTimeout();
        const enabled = settings.autoWrap.enabled;
        const onOffText = enabled.value != override ? "on" : "off";
        if (settings.autoWrap.notification === 'icon') {
            sbItem.tooltip = makeTooltip(settings, override);
            sbItem.text = "A$(word-wrap)";
            sbItem.color = override ?
                (enabled.value ? 'gray' : 'orange') : defaultColor;
            enabled.value || override ? sbItem.show() : sbItem.hide();
        }
        else if (wasToggled) {
            sbItem.text = `Auto-wrap: ${onOffText}`;
            sbItem.show();
            timeout = setTimeout(hideAfterTimeout, 5000);
        }
    }
    Notification.maybeShow = maybeShow;
    function makeTooltip(settings, override) {
        function str({ name, value, origin }, vFn, text, showName = false) {
            const scopes = ["default", "user", "workspace", "workspace folder"];
            const lang = origin.language ? `[${origin.language}] ` : "";
            const n = showName ? `'${name}' ` : "";
            text = text || name.split('.').slice[-1][0] + ":";
            return `${text} ${vFn(value)} (${lang}${n}${scopes[origin.scope]} setting)`;
        }
        const bStr = (x) => x ? "on" : "off";
        const colsStr = (cols) => cols.length > 1 ? "columns: " + cols : "column " + cols[0];
        const lines = [];
        const awEnabled = settings.autoWrap.enabled;
        if (override) {
            const onOffText = bStr(awEnabled.value != override);
            lines.push(`Auto-wrap toggled ${onOffText} for this document`);
            lines.push(`Normally: ${bStr(awEnabled.value)}`);
        }
        else
            lines.push(str(awEnabled, bStr, "Auto-wrap:"));
        lines.push(str(settings.columns, colsStr, "Wrapping at", true));
        return lines.join("\n");
    }
})(Notification || (Notification = {}));
let changeHook = null;
const setDocumentAutoWrap = (wsState, doToggle) => async (editor) => {
    const settings = Settings_1.getEditorSettings(editor), enabled = settings.autoWrap.enabled;
    // For every document, we store if autowrap has been toggled on or off. This
    // translates into a value for whether it has been overridden from the
    // current settings.
    const override = await (async function () {
        const key = editor.document.uri + ':autoWrap.enabled';
        let val = wsState.get(key);
        if (doToggle) {
            val = val === undefined || val === enabled.value ? !enabled.value : undefined;
            await wsState.update(key, val);
        }
        return val !== undefined;
    }());
    Notification.maybeShow(settings, override, doToggle);
    const isOn = enabled.value != override;
    if (isOn && !changeHook)
        changeHook = vscode_1.workspace.onDidChangeTextDocument(checkChange);
    else if (!isOn && changeHook) {
        changeHook.dispose();
        changeHook = null;
    }
};
let editorListener, configListener;
function default_1(memento) {
    const onChangeEditor = setDocumentAutoWrap(memento, false);
    const ifActiveDoc = fn => vscode_1.window.activeTextEditor && fn(vscode_1.window.activeTextEditor);
    editorListener = vscode_1.window.onDidChangeActiveTextEditor(e => e && onChangeEditor(e));
    configListener = vscode_1.workspace.onDidChangeConfiguration(e => ifActiveDoc(ed => e.affectsConfiguration('rewrap.autoWrap', ed.document) && onChangeEditor(ed)));
    ifActiveDoc(onChangeEditor);
    return {
        editorToggle: setDocumentAutoWrap(memento, true),
    };
}
exports.default = default_1;
//# sourceMappingURL=AutoWrap.js.map