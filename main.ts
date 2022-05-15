import { App, TFile, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

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
		console.log('Packrat: Loading...')

		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PackratSettingTab(this.app, this));

		// This adds a Command to the Command Palette				
		this.addCommand({
			id: 'tasks-run-packrat',
			name: 'Process completed recurring Tasks within the active note',

			checkCallback: (checking: boolean) => {
				// Packrat only works on an open markdown (.md) note file
				const { workspace } = this.app;
				const activeFile = workspace.getActiveFile();
				if (!activeFile || activeFile.extension !== "md") {
				} else {
					if (!checking) {
						this.ProcessCompletedRecurringTasks(activeFile);
					}
					// Command Palette will only display this command when the check function returns true
					return true;
				}
			}
		});
	}

	onunload() {
		console.log('Packrat: Unloading...')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async ProcessCompletedRecurringTasks(activeFile): Promise<void> {
		const { vault } = this.app;

		const rruleSignifier = "🔁".normalize();
		const deleteSignifier = this.settings.deletion_signifier;
		const archiveSignifier = this.settings.archive_signifier;
		const bottomSignifier = this.settings.bottom_signifier;
		const archiveFilename = this.settings.archive_filepath;

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

		for (let i = 0; i < fileContents.length; i++) {
			thisLine = fileContents[i];
			let firstFive = thisLine.substring(0, 5).toUpperCase()
			// test if this is a completed task
			if (firstFive == "- [X]") {
				// test if line includes Tasks' recurrence signifier 🔁
				if (0 < thisLine.indexOf(rruleSignifier)) {
					// test for 'delete' signifier
					if (0 < thisLine.indexOf(deleteSignifier)) {
						deletedTaskCount += 1;
						continue;
					}
					// test for 'archive' signifier
					if (0 < thisLine.indexOf(archiveSignifier)) {
						archiveLines.push(thisLine);
						archivedTaskCount += 1;
						continue;
					}
					// test for 'move' signifier
					if (0 < thisLine.indexOf(bottomSignifier)) {
						appendLines.push(thisLine);
						movedTaskCount += 1;
						continue;
					}
					// no matching signifier
					writebackLines.push(thisLine);
				}
			} else {
				writebackLines.push(thisLine);
			}
		}

		// write designated Tasks to archive file
		const archiveFile =
			vault.getAbstractFileByPath(archiveFilename) ||
			(await vault.create(archiveFilename, ""));

		if (!(archiveFile instanceof TFile)) {
			new Notice(`${archiveFilename} is not a valid markdown file`);
		} else {
			let archiveFileContents = await vault.read(archiveFile);
			archiveFileContents = archiveFileContents.split("\n");
			archiveFileContents = archiveFileContents.concat(archiveLines);
			vault.modify(archiveFile, archiveFileContents.join("\n"));
		}

		// rewrite active Note file with designated Tasks at bottom and Deleted and Archived tasks removed
		results = writebackLines.concat(appendLines);
		vault.modify(activeFile, results.join("\n"));
		var tdMsg = `${deletedTaskCount} tasks deleted\n`;
		var tmMsg = `${movedTaskCount} tasks moved to end of note\n`;
		var taMsg = `${archivedTaskCount} tasks archived\n`;
		const noticeText = tdMsg + tmMsg + taMsg;
		new Notice(noticeText);
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
			.setDesc('Text to trigger deletion of completed recurring Task instance')
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
			.setDesc('Text to trigger moving completed recurring Task instance to bottom of Active note')
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
			.setDesc('Text to trigger moving completed recurring Task instance to archive note')
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
			.setDesc('Relative filepath to archive file (include ".md" extension)')
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