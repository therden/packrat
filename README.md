# **PaCkRaT** 🐀

![](./packrat.gif)

This plugin for [Obsidian.md](https://obsidian.md/) adds functionality to Martin Schenk's excellent [Obsidian Tasks](https://github.com/schemar/obsidian-tasks) plugin.

**Tasks** supports recurring tasks:  when **Tasks** is used to mark such a task as having been completed, it creates the next instance of that task and inserts it in a new line immediately above the just-completed instance.

## The problem

While this default behavior is "alright" completed instances of recurring tasks tend to accumulate and clutter up the note file in which they originate.

My completed recurring tasks fall into three categories:

1. those which I want moved to the bottom of their note file
2. those which I want archived (appended to a separate note file)
3. those which I want deleted

## The solution -- use **Packrat**

With a markdown note file open in **Obsidian**, select "Packrat:  Process completed recurring Tasks within the active note" from the *Command Palette*.

**packrat** will scan the file for completed instances of recurring tasks and act upon each based upon any trigger value contained within it.

## Trigger values and archive file name and location

By default the trigger for each **packrat** action takes the form of an html comment (surrounded by a two pairs of % characters).

| Default triggers | Action on completed recurring task instance     |
|------------------|------------------------------------------------ |
| %%done_end%%     | Move task to the bottom of the active note file |
| %%done_log%%     | Append task to designated archive file          |
| %%done_del%%     | Delete task                                     |

These default triggers reflect my personal preference to avoid clutter when viewing my tasks in Preview mode and also avoids clutter in the Tag pane.

However, the trigger values can be changed within **packrat**'s settings -- to #tags, or @values, or any other text string (including Unicode characters) that **Obsidian** supports.

By default, **packrat** appends completed recurring tasks that you want to archive to a file named `archive.md` located in the root directory of the vault -- it will create the file if it doesn't already exist.  Both the location and name of this "archive file" can be changed in **packrat**'s settings; the only requirement is that the file have an ".md" extension.

## Installation

**packrat** has not yet been reviewed and accepted as a Community Plugin.  

Until it is (*if* it ever is:  because I don't really know Typescript/Javascript, I pretty much hacked this together -- it probably doesn't meet code quality standards, and I may not be capable of doing much about that), this plugin can be installed manually as follows:

1. Create the following subidirectory of your **Obsidian** vault: `.obsidian/plugins/packrat/`
2. From this repo, copy the files `main.js`, `styles.css`, `manifest.json` to that subdirectory
3. Within **Obsidian**, open your vault, go to Settings | Community Plugins; and in the 'Installed Plugins' section, click the *Reload Plugins* icon.
4. Enable the **packrat** plugin (optionally changing its default settings.)
