import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

export interface PackratSettings {
	deletion_trigger: string;
	bottom_trigger: string;
	archive_trigger: string;
	archive_filepath: string;
}

export const DEFAULT_SETTINGS: PackratSettings = {
	deletion_trigger: '%%done_del%%',
	bottom_trigger: '%%done_end%%',
	archive_trigger: '%%done_log%%',
	archive_filepath: 'archive.md',
}

export default class PackratPlugin extends Plugin {
	settings: PackratSettings;

	async onload() {
		console.log('Packrat: Loading...')

		await this.loadSettings();

		this.addSettingTab(new PackratSettingTab(this.app, this));

		this.addCommand({  // (to the Command Palette)
			id: 'run',
			name: 'Process completed recurring Tasks within the active note',

			checkCallback: (checking: boolean) => {
				// Packrat only works on an open markdown (.md) note file
				const { workspace } = this.app;
				const activeFile = workspace.getActiveFile();
				// Include in Command Palette only when function returns true
				if (activeFile && activeFile.extension == "md") {
					if (checking) {
						return true;
					}
					// Actually execute command
					this.ProcessCompletedRecurringTasks(activeFile);
				} else {
					return false;
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

	async ProcessCompletedRecurringTasks(activeFile: TFile): Promise<void> {

		try {
			const { vault } = this.app;
			const rruleSignifier = "🔁".normalize();
			const dv_rruleSignifier = "[repeat::";
			const deleteTrigger = this.settings.deletion_trigger;
			const archiveTrigger = this.settings.archive_trigger;
			const bottomTrigger = this.settings.bottom_trigger;
			const archiveFilename = this.settings.archive_filepath;
			const archiveFile =
				(vault.getAbstractFileByPath(archiveFilename)) ||
				(await vault.create(archiveFilename, ""));
			if (!(archiveFile instanceof TFile)) {
				const msg = "Problem with Archive filename. (Maybe a directory?"
				new Notice(msg);
				console.log(msg);
				return;
			}

			let deletedTaskCount = 0;
			let movedTaskCount = 0;
			let archivedTaskCount = 0;
			let thisLine = "";
			const writeBackLines:string[] = [];
			const appendLines:string[] = [];
			const archiveLines:string[] = [];

			const fileContentsString = await vault.read(activeFile);
			const fileContentsArray = fileContentsString.split("\n");

			for (let i = 0; i < fileContentsArray.length; i++) {
				thisLine = fileContentsArray[i];
				const firstFive = thisLine.trim().substring(0, 5).toUpperCase()
				// test whether this is a completed instance of recurring Task
				if (firstFive === "- [X]" && (thisLine.indexOf(rruleSignifier) != -1 || thisLine.indexOf(dv_rruleSignifier) != -1)) {
					// test for 'delete' trigger
					if (0 < thisLine.indexOf(deleteTrigger)) {
						deletedTaskCount += 1;
						continue;
					}
					// test for 'archive' trigger
					if (0 < thisLine.indexOf(archiveTrigger)) {
						archiveLines.push(thisLine);
						archivedTaskCount += 1;
						continue;
					}
					// test for 'move' trigger
					if (0 < thisLine.indexOf(bottomTrigger)) {
						appendLines.push(thisLine);
						movedTaskCount += 1;
						continue;
					}
					// completed recurring Task with no Packrat triggers
					writeBackLines.push(thisLine);
				}
				else {
					// not a completed recurring Task
					writeBackLines.push(thisLine);
				}
			}

			if (archivedTaskCount > 0) { // otherwise needn't modify archiveFile
				const archiveFileContentsString = await vault.read(archiveFile);
				let archiveFileContentsArray = archiveFileContentsString.split("\n");
				archiveFileContentsArray = archiveFileContentsArray.concat(archiveLines);
				await vault.modify(archiveFile, archiveFileContentsArray.join("\n"));
			}

			// rewrite active Note file with designated Tasks at bottom and Deleted and Archived tasks removed
			const results = writeBackLines.concat(appendLines);
			await vault.modify(activeFile, results.join("\n"));
			const tdMsg = `${deletedTaskCount} tasks deleted\n`;
			const tmMsg = `${movedTaskCount} tasks moved to end of note\n`;
			const taMsg = `${archivedTaskCount} tasks archived\n`;
			const noticeText = tdMsg + tmMsg + taMsg;
			new Notice(noticeText);
		} catch (err) {
			new Notice(err);
			console.log(err);
			return;
		}
	}
}

class PackratSettingTab extends PluginSettingTab {
	plugin: PackratPlugin;

	public defaultDeletionTrigger = "%%done_del%%";
	public defaultBottomTrigger = "%%done_move%%";
	public defaultArchiveTrigger = "%%done_log%%";
	public defaultArchiveFilepath = "logfile.md";

	constructor(app: App, plugin: PackratPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Packrat plugin settings' });

		new Setting(containerEl)
			.setName('Deletion trigger')
			.setDesc('Text to trigger deletion of completed recurring Task instance')
			.addText(text => text
				.setPlaceholder(this.defaultDeletionTrigger)
				.setValue(this.plugin.settings.deletion_trigger)
				.onChange(async (value) => {
					console.log('deletion_trigger: ' + value);
					this.plugin.settings.deletion_trigger = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('"Move to end of file" trigger')
			.setDesc('Text to trigger moving completed recurring Task instance to bottom of Active note')
			.addText(text => text
				.setPlaceholder(this.defaultBottomTrigger)
				.setValue(this.plugin.settings.bottom_trigger)
				.onChange(async (value) => {
					console.log('bottom_trigger: ' + value);
					this.plugin.settings.bottom_trigger = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Archive trigger')
			.setDesc('Text to trigger moving completed recurring Task instance to archive note')
			.addText(text => text
				.setPlaceholder(this.defaultArchiveTrigger)
				.setValue(this.plugin.settings.archive_trigger)
				.onChange(async (value) => {
					console.log('archive_trigger: ' + value);
					this.plugin.settings.archive_trigger = value;
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