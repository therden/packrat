# **Packrat** 🐀

![](./packrat.gif)

This plugin for [Obsidian.md](https://obsidian.md/) adds functionality to Martin Schenck's indispensable  [Obsidian Tasks](https://github.com/schemar/obsidian-tasks) plugin.

| :exclamation:  Don't install **Packrat** unless you use **Tasks**! |
|--------------------------------------------------------------------|

**Tasks** supports tasks with recurrence rules:  when **Tasks** is used to mark a recurring task as having been completed, it inserts the next instance of that task in a new line above the just-completed instance.

## And what's wrong with that?

The above behavior is "alright"; but *completed instances of recurring tasks* tend to accumulate in the note file in which they originate.  Items that recur every few days, or even every week, quickly begin to clutter up the note they're in.

## What are you gonna do about it?

After some reflection, I realized that my completed recurring tasks fall into three categories:

1. those that I don't care to keep -- they can be deleted
2. those that I want to retain within their original note file, but relocated at the end/bottom
3. those that I want to move to a separate archival note file

By including within your recurring tasks a 'trigger' that identifies which of the above actions you want to apply to your completed instances, we can automate those actions.

## Default "triggers"

The *default* "trigger" for each **Packrat** action takes the form of an *html comment* (text surrounded by a two pairs of % characters):

| Default trigger | Action on completed recurring task instance     |
|-----------------|------------------------------------------------ |
| %%done_end%%    | Move task to the bottom of the active note file |
| %%done_log%%    | Append task to designated archive file          |
| %%done_del%%    | Delete task                                     |

I chose to use *comments* because they aren't displayed in **Obsidian**'s Preview mode, and also to keep them out of its *Tag* pane.

However, you can change the trigger values within **Packrat**'s settings -- to #tags, or @values, or any other string (including Unicode characters) that **Obsidian** supports.

## Using **Packrat**

**Packrat** adds a single command to Obsidian.

Assuming that you have a markdown file open as your active note, invoke the *Command Palette* and select "Packrat: Process completed recurring Tasks within the active note".

When that command is issued, **Packrat** will scan the file for completed instances of recurring tasks and act on each depending on the trigger value(s) it contains.

## Default 'archive file'

By default, **Packrat** appends completed recurring tasks that you want to archive to a file named `archive.md` located in the root directory of the vault.  It will create the file if it doesn't already exist.  

Both the location and name of this "archive file" can be changed in **Packrat**'s settings; the only requirements are that the filepath must exist and the filename must have an ".md" extension.

## Installation

**Packrat** has not yet been reviewed and accepted as a Community Plugin.

Until it is, it can be installed manually as follows:

1. Create the following subidirectory of your **Obsidian** vault: `.obsidian/plugins/packrat/`
2. From the most recent Release for the repo, copy the files `main.js`, `styles.css`, `manifest.json` to that subdirectory
3. Within **Obsidian**, open your vault, go to Settings | Community Plugins; and in the 'Installed Plugins' section, click the *Reload Plugins* icon.
4. Enable the **Packrat** plugin (optionally changing its default settings.)
