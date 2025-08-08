# Project Graph

This directory contains a system for modeling the software architecture of the `tsx_viewer` project.

## Purpose

The goal of this system is to:

*   **Document:** Provide a single source of truth for the project's components, their purposes, and their interactions.
*   **Audit:** Automatically check for discrepancies between the documented graph and the actual file structure of the project.
*   **Automate Commits:** Facilitate the creation of clean, atomic Git commits based on predefined rules.
*   **Visualize:** (Future) Generate diagrams and other visualizations of the project architecture from the graph data.






## Structure

*   `project_graph.jsonnet`
    *   The root file that assembles the entire graph, including project metadata, entities, relations, policies, and commit grouping rules.
*   `graph_parts/`
    *   `entities.jsonnet`: Defines all the core components, files, and resources of the project.
    *   `relations.jsonnet`: Defines the relationships *between* the entities (e.g., which component uses which, IPC channels).
    *   `templates.jsonnet`: Reusable schemas for different types of entities.
    *   `policies.jsonnet`: Defines architectural rules and conventions for the project.
    *   `meta.jsonnet`: Contains metadata about the project graph itself.
    *   `ai_commands.jsonnet`: Defines mappings for AI assistant commands.
*   `scripts/`
    *   `ai_committer.mjs`: The script that automates the creation of categorized Git commits based on the `commitGroups` defined in `project_graph.jsonnet`.
    *   `graph_generator.mjs`: The script that generates this README and compares the graph to the live project files and reports any drift.
    *   `graph_validator.mjs`: (Future) A script to validate the graph against the policies defined in `policies.jsonnet`.
    *   `sync_ai_commands.mjs`: The script that synchronizes AI command definitions across various AI assistant rule files.


## Usage

To interact with the project graph system, use the following npm scripts:

*   **Audit the Graph:** To ensure the graph is in sync with the actual project files and refresh the compiled graph for AI agents:
    ```bash
    node project_graph/scripts/graph_generator.mjs --keep-compiled
    # or, if you have npm scripts configured
    npm run graph:audit
    ```

*   Planned: **Automate Commits:** Not implemented yet. When available, it will create clean, atomic commits based on `policies.commitGroups`.

*   Planned: **Synchronize AI Commands:** Not implemented yet. When available, it will update AI assistant rule files with the latest command definitions.

## Compiled Graph for AI Agents

The compiled graph is written to `project_graph/.cache/graph.json` on each run of the generator. This JSON is the definitive, machine-readable source of project information for AI agents.

- Path: `project_graph/.cache/graph.json`
- Persistence: Controlled via `project_graph/settings.json` (`keep_compiled_graph`) or the `--keep-compiled` CLI flag. By default, the compiled graph is kept.
- Interpretation: Prefer reading this JSON over parsing the Jsonnet directly. The structure mirrors `project_graph.jsonnet` with all imports resolved and a `timestamp` embedded in metadata blocks for traceability.

## Configuration

### `settings.json`

This file (`project_graph/settings.json`) is automatically generated the first time `npm run graph:audit` is executed. It contains user-configurable options that influence the behavior of the project graph scripts. All scripts will read the current settings from this file.

Each option within `settings.json` includes a `value` and a `description` to make it self-documenting.

Example `settings.json` structure:

```json
{
  "settingsFileMetadata": {
    "fileName": "settings.json",
    "filePath": "project_graph/settings.json",
    "description": "Configuration file for project-specific settings, including AI agent behaviors."
  },
  "options": {
    "audit_after_commit": {
      "value": false,
      "description": "Automatically run a focused audit on committed files after each `graph:commit` operation."
    },
    "update_memory_bank_on_audit": {
      "value": true,
      "description": "Log audit results to the memory-bank/audit_logs.md file."
    }
  }
}
```

### `commitGroups`

The `commitGroups` in `project_graph.jsonnet` define how files are categorized for automated commits. Each group specifies:
*   `name`: A short, descriptive name for the commit type (e.g., `feat`, `docs`).
*   `patterns`: An array of glob patterns that match files belonging to this group.
*   `messagePrefix`: The prefix to use in the commit message (e.g., `feat:`, `docs:`).
*   `description`: A brief explanation of the commit type.

Files that do not match any specific pattern will be assigned to the `chore` group by default.






## AI Assistant Command Mapping

To streamline interaction with AI assistants, you can configure them to trigger `npm run graph:audit` and `npm run graph:commit` using simpler, more conversational commands. Below are examples of how to set this up for various AI assistants, based on the definitions in `graph_parts/ai_commands.jsonnet`.

**Important:** The exact syntax and capabilities may vary between AI assistants. Refer to your specific AI's documentation for precise configuration details.

### For Cursor (`.cursor/rules/general-rules.mdc`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Gemini Code Assistant (`.gemini/GEMINI.md`)

```markdown
- **Command Aliases:** When the user requests "graph-audit" or "audit graph" or "check graph" or "run audit", execute `node project_graph/scripts/graph_generator.mjs`.
- **Command Aliases:** When the user requests "graph-commit" or "commit graph" or "auto commit" or "run committer", execute `npm run graph:commit`.
- **Command Aliases:** When the user requests "sync-ai-commands" or "sync ai" or "update ai rules" or "sync assistant commands", execute `npm run sync:ai-commands`.
```

### For Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```


## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Gemini Code Assistant (`.gemini/GEMINI.md`)

```markdown
- **Command Aliases:** When the user requests "graph-audit" or "audit graph" or "check graph" or "run audit", execute `node project_graph/scripts/graph_generator.mjs`.
- **Command Aliases:** When the user requests "graph-commit" or "commit graph" or "auto commit" or "run committer", execute `npm run graph:commit`.
- **Command Aliases:** When the user requests "sync-ai-commands" or "sync ai" or "update ai rules" or "sync assistant commands", execute `npm run sync:ai-commands`.
```

### For Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```


## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Gemini Code Assistant (`.gemini/GEMINI.md`)

```markdown
- **Command Aliases:** When the user requests "graph-audit" or "audit graph" or "check graph" or "run audit", execute `node project_graph/scripts/graph_generator.mjs`.
- **Command Aliases:** When the user requests "graph-commit" or "commit graph" or "auto commit" or "run committer", execute `npm run graph:commit`.
- **Command Aliases:** When the user requests "sync-ai-commands" or "sync ai" or "update ai rules" or "sync assistant commands", execute `npm run sync:ai-commands`.
```

### For Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```


## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Gemini Code Assistant (`.gemini/GEMINI.md`)

```markdown
- **Command Aliases:** When the user requests "graph-audit" or "audit graph" or "check graph" or "run audit", execute `node project_graph/scripts/graph_generator.mjs`.
- **Command Aliases:** When the user requests "graph-commit" or "commit graph" or "auto commit" or "run committer", execute `npm run graph:commit`.
- **Command Aliases:** When the user requests "sync-ai-commands" or "sync ai" or "update ai rules" or "sync assistant commands", execute `npm run sync:ai-commands`.
```

### For Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```


## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Gemini Code Assistant (`.gemini/GEMINI.md`)

```markdown
- **Command Aliases:** When the user requests "graph-audit" or "audit graph" or "check graph" or "run audit", execute `node project_graph/scripts/graph_generator.mjs`.
- **Command Aliases:** When the user requests "graph-commit" or "commit graph" or "auto commit" or "run committer", execute `npm run graph:commit`.
- **Command Aliases:** When the user requests "sync-ai-commands" or "sync ai" or "update ai rules" or "sync assistant commands", execute `npm run sync:ai-commands`.
```

### For Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```

### For Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.

```


## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `npm run graph:audit`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync AI Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.
```

### For Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `npm run graph:audit`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync AI Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.
```

### For Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `npm run graph:audit`
- **Description:** Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.

## Sync AI Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Synchronizes AI command definitions across various AI assistant rule files.
```

## For LLMs (Large Language Models)

For guidelines on how LLMs can best understand and utilize the `project_graph` system, refer to [`LLM_GUIDELINES.md`](LLM_GUIDELINES.md).
## Drift

- observedNotDeclared: 0
- declaredNotObserved: 13

