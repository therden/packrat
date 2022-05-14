// import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { App, Editor, TFile, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, finishRenderMath } from 'obsidian';
import { test } from 'scratch';

// Remember to rename these classes and interfaces!

export interface PackratSettings {
	deletion_signifier: string;
	bottom_signifier: string;
	archive_signifier: string;
	archive_filepath: string;
}

export const DEFAULT_SETTINGS: PackratSettings = {
	deletion_signifier: '%%done_del%%',
	bottom_signifier: '%%done_end%%',
	archive_signifier: '%%done_log%%',
	archive_filepath: 'archive.md',
}

export default class PackratPlugin extends Plugin {
	settings: PackratSettings;

	async onload() {
		console.log('Loading Packrat')

		await this.loadSettings();

		this.addCommand({
			id: 'tasks-run-packrat',
			name: 'Process completed recurring Tasks in active note',

			checkCallback: (checking: boolean) => {
				// Conditions to check
				// Packrat only works on an open markdown (.md) note file
				const { workspace } = this.app;
				// const activeView = workspace.getActiveViewOfType(MarkdownView);
				const activeFile = workspace.getActiveFile();
				if (!activeFile || activeFile.extension !== "md") {
				} else {
					if (!checking) {
						// new Notice('Packrat plugin is Go!');
						// this.averageFileLength();  // test example
						this.ProcessCompletedRecurringTasks(activeFile);
					}
					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PackratSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading Packrat')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async ProcessCompletedRecurringTasks(activeFile): Promise<void> {
		const { vault } = this.app;

		let deletedTaskCount = 0;
		let movedTaskCount = 0;
		let archivedTaskCount = 0;
		let thisLine = "";
		let writebackLines = [];
		let appendLines = [];
		let archiveLines = [];
		let results = [];

		let fileContents = await vault.read(activeFile);
		fileContents = fileContents.split("\n");
		const rruleSignifier = "🔁".normalize()
		const deleteSignifier = "%%done_del%%"
		const archiveSignifier = "%%done_log%%"
		const bottomSignifier = "%%done_move%%"
		// new Notice(fileContents[0, 2, 4]);

		for (let i = 0; i < fileContents.length; i++) {
			thisLine = fileContents[i];
			let firstFive = thisLine.substring(0, 5).toUpperCase()
			// test if this is a completed task
			if (firstFive == "- [X]") {
				// new Notice("completed: " + thisLine)
				// test if line includes Tasks' recurrence signifier 🔁
				if (0 < thisLine.indexOf(rruleSignifier)) {
					// var msg = ("completed and recurring: " + thisLine);
					// console.log(msg);
					// new Notice(msg);
					// test for 'delete' signifier
					if (0 < thisLine.indexOf(deleteSignifier)) {
						deletedTaskCount += 1;
						var msg = ("Delete " + thisLine);
						console.log(msg);
					}
					// test for 'archive' signifier
					if (0 < thisLine.indexOf(archiveSignifier)) {
						archiveLines.push(thisLine);
						archivedTaskCount += 1;
						var msg = ("Archive " + thisLine);
						console.log(msg);
					}
					// test for 'move' signifier
					if (0 < thisLine.indexOf(bottomSignifier)) {
						appendLines.push(thisLine);
						movedTaskCount += 1;
						var msg = ("Move " + thisLine);
						console.log(msg);
					}
				}
			} else {
				writebackLines.push(thisLine);
			}
		}

		const archiveFile = "./archive.md"
		// if () {

		// }
		// let archiveFileContents = await vault.read(archiveFile);
		// // let archiveFileContents = archiveFileContents.split("\n");
		// archiveFileContents = archiveFileContents.concat(archiveLines);
		// vault.modify(archiveFile, archiveFileContents.join("\n"));

		// appendLines.push("Line to add to bottom of file -- testing only");
		results = writebackLines.concat(appendLines);
		vault.modify(activeFile, results.join("\n"));


		const noticeText = `${deletedTaskCount} tasks deleted\n${movedTaskCount} tasks moved to end of note\n${archivedTaskCount} tasks archived`;
		new Notice(noticeText);
	}

	async averageFileLength(): Promise<void> {  // test example
		const { vault } = this.app;

		const fileContents: string[] = await Promise.all(
			vault.getMarkdownFiles().map((file) => vault.read(file))
		);

		let totalLength = 0;
		fileContents.forEach((content) => {
			totalLength += content.length;
		});

		// return totalLength / fileContents.length;
		const avgFileLength = totalLength / fileContents.length;
		new Notice(`The average file length is ${avgFileLength} characters.`);
	}
}

class PackratSettingTab extends PluginSettingTab {
	plugin: PackratPlugin;

	public defaultDeletionsignifier = "%%done_del%%";
	public defaultBottomsignifier = "%%done_move%%";
	public defaultArchivesignifier = "%%done_log%%";
	public defaultArchiveFilepath = "logfile.md";

	constructor(app: App, plugin: PackratPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Done Gone plugin settings' });

		new Setting(containerEl)
			.setName('Deletion signifier')
			.setDesc('Text to signifier deletion of completed recurring Task instance')
			.addText(text => text
				.setPlaceholder(this.defaultDeletionsignifier)
				.setValue(this.plugin.settings.deletion_signifier)
				.onChange(async (value) => {
					console.log('deletion_signifier: ' + value);
					this.plugin.settings.deletion_signifier = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('"Move to end of file" signifier')
			.setDesc('Text to signifier moving completed recurring Task instance to bottom of note')
			.addText(text => text
				.setPlaceholder(this.defaultBottomsignifier)
				.setValue(this.plugin.settings.bottom_signifier)
				.onChange(async (value) => {
					console.log('bottom_signifier: ' + value);
					this.plugin.settings.bottom_signifier = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Archive signifier')
			.setDesc('Text to signifier archiving of completed recurring Task instance')
			.addText(text => text
				.setPlaceholder(this.defaultArchivesignifier)
				.setValue(this.plugin.settings.archive_signifier)
				.onChange(async (value) => {
					console.log('archive_signifier: ' + value);
					this.plugin.settings.archive_signifier = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Archive file')
			.setDesc('Relative filepath to archive file')
			.addText(text => text
				.setPlaceholder(this.defaultArchiveFilepath)
				.setValue(this.plugin.settings.archive_filepath)
				.onChange(async (value) => {
					console.log('archive_filepath: ' + value);
					this.plugin.settings.archive_filepath = value;
					await this.plugin.saveSettings();
				}));

	}
}
