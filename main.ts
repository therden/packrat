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

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	new Notice('This is a notice!');
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

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

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}
// 
// 	onOpen() {
// 		const { contentEl } = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }

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
