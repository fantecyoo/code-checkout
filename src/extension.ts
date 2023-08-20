import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const branchMap = new Map<string, string[]>();
let previousBranch: string | null;

async function getCurrentBranch(): Promise<string> {
	return new Promise((resolve, reject) => {
		if(vscode.workspace.workspaceFolders) {
			const HEAD = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.git', 'HEAD');
			// 异步返回文件内容
			fs.readFile(HEAD, 'utf8', function (err, data) {	
				if (err) {
					resolve('no branch')
				} else {
					resolve(data)
				}
			});
		} else {
			resolve('no branch')
		}
	})
}

export async function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('fast-code.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('fast-code!');
	});
	if (vscode.workspace.workspaceFolders) {
		const gitHeadPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.git', 'logs/HEAD');
		previousBranch = await getCurrentBranch()
		fs.watch(gitHeadPath, (eventType, filename) => {
			if (eventType === 'change') {
				// vscode.window.showInformationMessage('Git 分支已变更');
				gitChangeHandler();
			}
		});
	}

	context.subscriptions.push(disposable);
}

async function gitChangeHandler(): Promise<void> {
	const currentBranch: string = await getCurrentBranch()
	if(currentBranch === 'no branch') return
	const openEditors = vscode.window.tabGroups.activeTabGroup.tabs.map((tab: any) => tab.input?.uri.path);

	// 将当前分支的编辑器存入map
	if (previousBranch) {
		branchMap.set(previousBranch, openEditors);
	}
	previousBranch = currentBranch

	await Promise.all(vscode.workspace.textDocuments.filter((doc) => doc.uri.scheme === 'file').map((doc) => doc.save())).then(() => {
		return vscode.commands.executeCommand('workbench.action.closeAllEditors')
	}).catch((err) => {
		vscode.window.showInformationMessage('关闭编辑器错误: ', err);
	})

	if (branchMap.has(currentBranch)) {
		const editors = branchMap.get(currentBranch);
		editors?.forEach((path) => {
			vscode.workspace.openTextDocument(path).then(async (doc) => {
				await vscode.window.showTextDocument(doc, { preview: false });
			})
		});
	}
}

export function deactivate() {}