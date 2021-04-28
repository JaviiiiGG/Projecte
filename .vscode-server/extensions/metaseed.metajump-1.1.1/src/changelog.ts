import { ChangeLogItem, ChangeLogKind } from "@landing-page/index";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.VERSION,   message: `V1.1.0 June 18, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `add MetaJump.DeleteToSmart command( 'alt+d'): to delete from cursor to the position smartly <a href="https://github.com/metaseed/metaGo/tree/master/src/metaJump#delete-to-any-character">(detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `add MetaJump.DeleteToBefore command( 'alt+backspace'): to delete from cursor to the position before the target character`},
  { kind: ChangeLogKind.ADDED,   message: `add MetaJump.DeleteToAfter command( 'alt+delete'): to delete from cursor to the position after the target character`},
  { kind: ChangeLogKind.ADDED,   message: `add delete command indicator: 'red block'`},
  { kind: ChangeLogKind.ADDED,   message: `add gif demo for delete commands <a href="https://github.com/metaseed/metaGo/tree/master/src/metaJump#delete-to-any-character">(detail)</a>`},
  { kind: ChangeLogKind.REMOVED,   message: `remove findAllMode config`},
  { kind: ChangeLogKind.FIXED,   message: `metaGo.selectSmart command: target cursor position is calculated by the same way as the metaGo.GotoSmart command`},
  { kind: ChangeLogKind.VERSION,   message: `V1.0.0 June 09, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `add metaJump.gif to show most features of metaJump`},
  { kind: ChangeLogKind.CHANGED,   message: `MetaJump extracted from MetaGo as a separated vscode extension.`},
  { kind: ChangeLogKind.CHANGED,   message: `rename insert* command to Add* command.`},
];
