import * as vscode from 'vscode';

let currentBranch: string | null;

let disposableList:(vscode.Disposable | undefined)[] = [];

export async function activate(context: vscode.ExtensionContext) {
	const gitExtension = vscode.extensions.getExtension('vscode.git')!.exports;
	const git = gitExtension.getAPI(1);
	vscode.window.showInformationMessage('Code-Checkout-Extension is now active!');

	const branchName = await getBranch('HEAD')
	if (branchName) {
		registerOnDidChangeRepositoryEvent(context, gitExtension, git);
	} else {
		registerOnDidChangeStateEvent(context, gitExtension, git);
	}
	// 添加右键菜单项
	context.subscriptions.push(vscode.commands.registerCommand('extension.activateFeature', function () {
		checkout(context);
	}));
}

function registerOnDidChangeStateEvent(context: vscode.ExtensionContext, gitExtension: any, git: any) {
	const disposable = git.onDidChangeState(async (e:any) => {
		vscode.window.showInformationMessage('onDidChangeState');
		// 初始化
		if (e === 'initialized') {
			registerOnDidChangeRepositoryEvent(context, gitExtension, git);
		}
	});

	disposableList.push(disposable);
}

// onDidChangeRepository
async function registerOnDidChangeRepositoryEvent(context: vscode.ExtensionContext, gitExtension: any, git: any) {
	// 如果当前工作区有多个仓库，暂时不支持
	if (git.repositories.length > 1) {
		vscode.window.showInformationMessage('暂不支持多仓库');
		return;
	}
	const disposable = gitExtension.model.onDidChangeRepository(async (e:any) => {
		const branchName = await getBranch('HEAD')
		if (!branchName) return;
		gitChangeHandler(branchName, context);
	});
	disposableList.push(disposable);
	currentBranch = await getBranch('HEAD')
	console.log(currentBranch,'onDidChangeState')
}

async function getBranch(value:string): Promise<string | null> {
	const gitExtension = vscode.extensions.getExtension('vscode.git')!.exports;
	const git = gitExtension?.getAPI(1);
	const branch = await git?.repositories?.[0]?.getBranch(value).then((branch:any) => branch.name);
	return branch
}

async function gitChangeHandler(switchingBranch:string, context: vscode.ExtensionContext): Promise<void> {
	if (switchingBranch !== currentBranch) {
		console.log('switchingBranch', switchingBranch)
		vscode.window.showInformationMessage('Git分支从: ' + currentBranch + ' 切换到: ' + switchingBranch);
		const openEditors = vscode.window.tabGroups.activeTabGroup.tabs.map((tab: any) => tab.input?.uri.path);

		// 将当前分支的编辑器存入map
		if (currentBranch) {
			context.workspaceState.update(`branchMap.${currentBranch}`, openEditors);
		}
		currentBranch = switchingBranch
		// 如果当前分支有编辑器，打开编辑器
		checkout(context);
	}
}

async function checkout(context: vscode.ExtensionContext) {
	if (!currentBranch) return;
	const editors = context.workspaceState.get<string[]>(`branchMap.${currentBranch}`);
	if (!editors) return;

	await Promise.all(vscode.workspace.textDocuments.filter((doc) => doc.uri.scheme === 'file').map((doc) => doc.save())).then(() => {
		return vscode.commands.executeCommand('workbench.action.closeAllEditors');
	}).catch((err) => {
		vscode.window.showInformationMessage('关闭编辑器错误: ', err);
	})
	editors.forEach((path) => {
		vscode.workspace.openTextDocument(path).then(async (doc) => {
			await vscode.window.showTextDocument(doc, { preview: false });
		})
	});
}

export function deactivate() {
	// 释放资源
	disposableList.forEach((disposable) => {
		disposable?.dispose();
	});
}
