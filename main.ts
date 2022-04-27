// import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { App, Editor, TFile, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface PackratSettings {
	deletion_signifier: string;
	bottom_signifier: string;
	archive_signifier: string;
	archive_filepath: string;
}

const DEFAULT_SETTINGS: PackratSettings = {
	deletion_signifier: '%%done_del%%',
	bottom_signifier: '%%done_end%%',
	archive_signifier: '%%done_log%%',
	archive_filepath: 'archive.md',
}

export default class PackratPlugin extends Plugin {
	settings: PackratSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'tasks-run-packrat',
			name: 'Tasks - process completed instances of recurring tasks within active note',

			checkCallback: (checking: boolean) => {
				// Conditions to check
				// Packrat only works on an open markdown (.md) note file
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile || activeFile.extension !== "md") {
				} else {
					if (!checking) {
						new Notice('Packrat plugin is Go!');
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

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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
