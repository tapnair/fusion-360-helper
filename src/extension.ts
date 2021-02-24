import * as vscode from 'vscode';
import { generateCppAddin, generatePythonAddin } from './Addin/createAddins';
import { getPythonLib } from './Intellisense/findPython';
import {launchFusion360} from './processLauncher';
import {checkFusionOpen} from './processLauncher';

export let fusionMenuItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	// This can be active by having a .manifest file in your folders

	vscode.window
		.showInformationMessage("This looks like a Fusion 360 Addin Directory. Would you like to configure it for development?", 'yes','no')
		.then(value => {
			if (value === "yes"){
				// Addin Creation
				let pythonAddin = vscode.commands.registerCommand('fusion-360-helper.createPythonAddin', generatePythonAddin);
				let cppAddin = vscode.commands.registerCommand('fusion-360-helper.createCppAddin', generateCppAddin);

				// Intellisense Linking
				let linkPython = vscode.commands.registerCommand('fusion-360-helper.linkPython', getPythonLib);

				const fusionMenuItemID = "fusion-360-helper.fusionMenuItem";

				fusionMenuItem = createStatusBarItem(fusionMenuItemID);
				let fusionMenuItemClick = vscode.commands.registerCommand(fusionMenuItemID, launchFusion360);

				let eventUpdate = vscode.window.onDidChangeWindowState(windowStateChange);
				// Subscribing to UI
				context.subscriptions.push(pythonAddin, cppAddin, linkPython, fusionMenuItem, fusionMenuItemClick, eventUpdate);

				fusionMenuItem.show();

				// set the status of the fusion menu text
				checkFusionOpen(false);
			}
			
		});
}

export function deactivate() {}

function createStatusBarItem(commandID: string): vscode.StatusBarItem {
	const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	myStatusBarItem.command = commandID;
	myStatusBarItem.text = "$(extensions-refresh) Finding Fusion 360";
	return myStatusBarItem;
}

/**
 * Function to tell me if the user is currently looking at the window.
 * Useful for updating UI elements so as to not constantly poll to see if fusion is open.
 * @param e Window State Event
 */
function windowStateChange(e: vscode.WindowState){
	// console.log(e);

	if (e.focused === true){
		checkFusionOpen(false);
		// I added a process callback in the spawnProcess code
		// leaving this here for now just in case
	}
}