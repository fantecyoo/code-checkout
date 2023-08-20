// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
export function activate1(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fast-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('fast-code.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from fast-code!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
// export function deactivate() {}

import * as vscode from 'vscode';

const branchMap = new Map<string, string[]>();

async function getCurrentBranch(): Promise<string> {
  const gitPath = vscode.workspace.getConfiguration('git').get<string>('path');
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!gitPath || !workspaceFolders) {
    return '';
  }
  const workspaceFolder = workspaceFolders[0];
  const cwd = workspaceFolder.uri.fsPath;
  const options = { cwd };
  const result = await vscode.commands.executeCommand<string>('git.exec', 'rev-parse', '--abbrev-ref', 'HEAD', options);
  return result.trim();
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
		console.log('event changed')
      if (event.affectsConfiguration('git.path')) {
        // git path changed, do something
		console.log('git path changed')
      }
    })
  );
  let disposable = vscode.commands.registerCommand('fast-code.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from fast-code!');
	});

	context.subscriptions.push(disposable);

//   context.subscriptions.push(
//     vscode.commands.registerCommand('extension.switchBranch', async () => {
//       const currentBranch = await getCurrentBranch();
//       const openEditors = vscode.window.visibleTextEditors.map((editor) => editor.document.uri.fsPath);

//       if (!branchMap.has(currentBranch)) {
//         branchMap.set(currentBranch, openEditors);
//       } else {
//         const editors = branchMap.get(currentBranch);
//         branchMap.set(currentBranch, [...editors, ...openEditors]);
//       }

//       if (branchMap.has(currentBranch)) {
//         const editors = branchMap.get(currentBranch);
//         vscode.window.visibleTextEditors.forEach((editor) => {
//           if (!editors.includes(editor.document.uri.fsPath)) {
//             editor.hide();
//           }
//         });
//         editors.forEach((path) => {
//           vscode.workspace.openTextDocument(path).then((doc) => {
//             vscode.window.showTextDocument(doc);
//           });
//         });
//       }
//     })
//   );
}

export function deactivate() {}
