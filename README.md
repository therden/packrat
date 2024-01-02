# **Packrat** 🐀

![](./packrat.gif)

> [!NOTE]
> As of version 1.1.1, **Packrat** supports both **Tasks** traditional emojis and Dataview-format inline fields.

While [Obsidian.md](https://obsidian.md/) provides basic support for Markdown-style tasks contained within a vault's note files, the amazing and (for many) indispensable [Tasks](https://github.com/schemar/obsidian-tasks) plugin -- originally created by [Martin Schenck](https://github.com/schemar) and now maintained by [Claire Macrae](https://github.com/claremacrae) -- considerably increases those capabilities.

For example, recurrence rules can be used such that, when **Tasks** is used to mark a task that includes such a rule as having been completed, it inserts the next instance of that task in a new line either above (or, if the user prefers, below) the just-completed instance of the task.

## And what's wrong with that?

The above behavior is "alright"; but *completed instances of recurring tasks* will accumulate in the note file in which they originate.  If those tasks recur frequently, they'll quickly clutter up the note they're in.

## What are you gonna do about it?

After some reflection, I realized that my completed recurring tasks fall into three categories:

1. those which I don't care to retain once they're done -- they can be deleted
2. those which I want to retain *within their note file of origin*, but relocated to the bottom of the note, out of the way of current/active material
3. those which I want to retain, but in a separate archival note file

**Packrat** adds a command (**Packrat: _Process completed recurring tasks within the active note_**) to your Obsidian vault.  When run, this commands executes the above actions on your current active note file, tidying up  completed instances of recurring tasks.  

All that's required is the addition, within each recurring task on which you want it to act, of a 'trigger' -- a string of characters that identifies which action you want to apply to your completed task instances, the command added by this **Packrat** plugin will automate those actions.

## Default "triggers"

The *default* "trigger" for each **Packrat** action takes the form of an *html comment* (text surrounded by a two pairs of % characters):

| Default trigger | Action on completed recurring task instance     |
|-----------------|------------------------------------------------ |
| `%%done_end%%`  | Move task to the bottom of the active note file |
| `%%done_log%%`  | Append task to designated archive file          |
| `%%done_del%%`  | Delete task                                     |

I chose to use *comments* because they aren't displayed in **Obsidian**'s *Preview mode* (although they *are* displayed in *Live Preview*), and because I prefer to keep the *Tags* list uncluttered.

However, you can change the "trigger" value of each supported Action within **Packrat**'s settings -- to a `#tag`, an emoji, an @value, or any other string (including Unicode characters) that is supported by **Obsidian** and your operating system.

## Using **Packrat**

**Packrat** adds a single command to Obsidian.

Assuming that you have a markdown file open as your active note, invoke Obsidian's *Command Palette* and select "Packrat: Process completed recurring Tasks within the active note".

When that command is issued, **Packrat** will scan the file for completed instances of recurring tasks and act on each according to the trigger value(s) it contains.

> [!TIP] 
> You may want to open the **Command Palette** Core plugin and to "pin" this command to the top of the list -- or assign a Hotkey to run it

## Default 'archive file'

By default, **Packrat** appends completed recurring tasks that you want to archive to a file named `archive.md` located in the root directory of the vault.  If the file doesn't already exist when the command is run, it will be created.

Both the name and location of this "archive of completed tasks" file can be changed in **Packrat**'s settings.  The only requirements are that the file path **must** exist and the any alternate filename entered in Settings **must** include the ".md" extension.

## I'm not sure I follow how this is supposed to work; can you give an example?

Sure!

The Packrat plugin acts only on **completed** checklist items in the currently active note when those feature both

- an [Obsidian Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks)-style **recurrence rule**, and
- at least one **trigger** (either the default values or per any alternative values set within the plug-in's *Settings*).

As an example, assume that the following represents the entire contents of a note file.

```
# Example checklist
- [ ] incomplete *non*-recurring task, with deletion trigger %%done_del%%
- [x] completed *non*-recurring task, with deletion trigger %%done_del%% ✅ 2023-12-29
- [-] cancelled, *non-recurring* task
- [-] *cancelled* instance of a recurring task with archive trigger %%done_log%% 🔁 every day 📅 2023-12-29
- [ ] incomplete recurring task with *no* trigger 🔁 every 2 days when done 📅 2023-12-31
- [x] completed recurring task with *no* trigger 🔁 every 2 days when done 📅 2023-12-29 ✅ 2023-12-29
- [ ] *incomplete* recurring task with bottom trigger %%done_end%% 🔁 every 3 days when done 📅 2023-12-30
- [x] completed recurring task with bottom trigger %%done_end%% 🔁 every 3 days when done 📅 2023-12-29 ✅ 2023-12-29
- [x] completed recurring task with bottom trigger %%done_end%% 🔁 every 3 days when done 📅 2023-12-26 ✅ 2023-12-26
- [ ] *incomplete* recurring task with archive trigger %%done_log%% 🔁 every 10 days 📅 2023-12-31
- [x] completed recurring task with archive trigger %%done_log%% 🔁 every 10 days 📅 2023-12-21 ✅ 2023-12-21
- [ ] *incomplete* recurring taskwith delete trigger %%done_del%%  🔁 every week on Wednesday 📅 2023-12-28
- [x] completed recurring task with delete trigger %%done_del%% 🔁 every week on Wednesday 📅 2023-12-21 ✅ 2023-12-21
```

If the command `Packrat: Process completed recurring Tasks within the active note` were run on an active note that contained the above task list, Packrat will only 'do something' with the final four completed checklist items.  The note file would then look as follows

```
# Example checklist
- [ ] incomplete *non*-recurring task, with deletion trigger %%done_del%%
- [x] completed *non*-recurring task, with deletion trigger %%done_del%% ✅ 2023-12-29
- [-] cancelled, *non-recurring* task
- [-] *cancelled* instance of a recurring task with archive trigger %%done_log%% 🔁 every day 📅 2023-12-29
- [ ] incomplete recurring task with *no* trigger 🔁 every 2 days when done 📅 2023-12-31
- [x] completed recurring task with *no* trigger 🔁 every 2 days when done 📅 2023-12-29 ✅ 2023-12-29
- [ ] *incomplete* recurring task with bottom trigger %%done_end%% 🔁 every 3 days when done 📅 2023-12-30
- [ ] *incomplete* recurring task with archive trigger %%done_log%% 🔁 every 10 days 📅 2023-12-31
- [ ] *incomplete* recurring taskwith delete trigger %%done_del%%  🔁 every week on Wednesday 📅 2023-12-28

- [x] completed recurring task with bottom trigger %%done_end%% 🔁 every 3 days when done 📅 2023-12-29 ✅ 2023-12-29
- [x] completed recurring task with bottom trigger %%done_end%% 🔁 every 3 days when done 📅 2023-12-26 ✅ 2023-12-26
```
the next-to-last completed recurring task 
```
- [x] completed recurring task with archive trigger %%done_log%% 🔁 every 10 days 📅 2023-12-21 ✅ 2023-12-21
```
would have been moved to the bottom of the designated archive file, and the fourth and final completed recurring task would have been deleted.

## Installation

**Packrat** can now be installed via the *Community Plugins* option within **Obsidian**'s *Settings* tab.

|> [!WARNING]
 > _**Don't**_ install **Packrat** unless you are using the **Tasks** plugin

