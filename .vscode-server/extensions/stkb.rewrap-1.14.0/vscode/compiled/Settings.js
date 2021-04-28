"use strict";
// Gets editor settings from the environment
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditorSettings = exports.getCoreSettings = void 0;
const vscode_1 = require("vscode");
/** Gets and validates a settings object from vscode's configuration. Doing this
 *  is not normally expensive. */
function getCoreSettings(editor, fn) {
    const settings = getEditorSettings(editor);
    return {
        column: fn(settings.columns.value),
        doubleSentenceSpacing: settings.doubleSentenceSpacing,
        wholeComment: settings.wholeComment,
        reformat: settings.reformat,
        tabWidth: settings.tabWidth,
    };
}
exports.getCoreSettings = getCoreSettings;
function getEditorSettings(editor) {
    const docID = editor.document.uri.toString();
    const config = vscode_1.workspace.getConfiguration('', editor.document);
    const setting = (name) => config.get(name);
    const checkTabSize = size => !Number.isInteger(size) || size < 1 ? warnings.tabSize(docID, size, 4) : size;
    return {
        autoWrap: getAutoWrapSettings(config, editor.document.languageId),
        columns: getWrappingColumns(config, editor.document),
        doubleSentenceSpacing: setting('rewrap.doubleSentenceSpacing'),
        wholeComment: setting('rewrap.wholeComment'),
        reformat: setting('rewrap.reformat'),
        tabWidth: checkTabSize(editor.options.tabSize),
    };
}
exports.getEditorSettings = getEditorSettings;
const getAutoWrapSettings = (config, lang) => ({
    enabled: settingWithOrigin(config, lang)('rewrap.autoWrap.enabled'),
    notification: config.get('rewrap.autoWrap.notification'),
});
/** Gets an array of the available wrapping column(s) from the user's settings.
 */
function getWrappingColumns(config, doc) {
    const checkColumn = (col) => !Number.isInteger(col) || col < 1 ? warnings.column(doc, col, 0)
        : col > 120 ? warnings.largeColumn(doc, col, col)
            : col;
    const get = settingWithOrigin(config, doc.languageId);
    {
        const s = get('rewrap.wrappingColumn');
        if (s.value)
            return { ...s, value: [checkColumn(s.value)] };
    }
    {
        const s = get('editor.rulers');
        const rValue = (r) => checkColumn(r.column != undefined ? r.column : r);
        if (s.value && s.value[0])
            return { ...s, value: s.value.map(rValue) };
    }
    {
        const s = get('editor.wordWrapColumn');
        return { ...s, value: [checkColumn(s.value)] };
    }
}
const settingWithOrigin = (config, lang) => (name) => {
    const scopes = ['default', 'global', 'workspace', 'workspaceFolder'];
    const info = config.inspect(name);
    for (let language of [lang, null]) {
        for (let scope = 3; scope >= 0; scope--) {
            const key = scopes[scope] + (language ? 'LanguageValue' : 'Value');
            if (info[key] !== undefined)
                return { name, value: info[key], origin: { scope, language } };
        }
    }
};
/** Deals with writing warnings for invalid values. */
const warnings = (() => {
    // For each invalid value for each document, remember that we've warned so
    // that we don't flood the console with the same warnings
    let cache = {};
    const warn = (setting, msg) => (doc, val, def) => {
        const key = doc.uri.toString() + "|" + setting + "|" + val;
        if (!cache[key]) {
            cache[key] = true;
            console.warn("Rewrap: " + msg, val, def);
        }
        return def;
    };
    const column = warn('wrappingColumn', "wrapping column is set at '%o'. This will be treated as infinity.");
    const largeColumn = warn('wrappingColumn', "wrapping column is a rather large value (%d).");
    const tabSize = warn('tabSize', "tab size is an invalid value (%o). Using the default of (%d) instead.");
    return { column, largeColumn, tabSize };
})();
//# sourceMappingURL=Settings.js.map