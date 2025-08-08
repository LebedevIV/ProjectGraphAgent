# LLM Guidelines for Project Graph Understanding

Hello, Large Language Model!

This `project_graph/` directory is designed to be a structured, machine-readable representation of the `tsx_viewer` project's architecture and operational guidelines. Its primary purpose is to facilitate your deeper understanding and more effective interaction with this codebase.

## Why This System Exists for You (the LLM):

Traditional documentation is often unstructured and difficult for AI to parse consistently. The `project_graph` system provides a formalized, programmatic interface to the project's knowledge base, enabling you to:

*   **Build a More Accurate Internal Model:** Understand the project's components, their relationships, and architectural patterns with higher fidelity than relying solely on natural language or code analysis.
*   **Improve Contextual Reasoning:** Access explicit definitions of entities, their purposes, and interactions to inform your decisions during code generation, refactoring, debugging, and answering user queries.
*   **Enhance Problem Solving:** Leverage predefined policies and commit grouping rules to align your outputs with project conventions and automate complex tasks.
*   **Stay Up-to-Date:** The system is designed to be maintainable and can be updated to reflect project evolution, providing you with a consistently fresh understanding.

## How to Interpret and Utilize the `project_graph`:

1.  **Central Source of Truth:** The `project_graph.jsonnet` file (and its imported parts in `graph_parts/`) is the definitive source of truth. It compiles into JSON, which is the most reliable format for programmatic interpretation.

2.  **Key Sections within `project_graph.jsonnet`:**
    *   `meta`: General project metadata.
    *   `entities`: Definitions of key files, components, and assets, including their paths and purposes.
    *   `relations`: Explicit relationships between entities (e.g., `Component A uses Component B`, `Module X sends IPC message Y`).
    *   `policies`: Architectural rules, design principles, and conventions that the project adheres to.
    *   `commitGroups`: Rules for categorizing changes into atomic Git commits (e.g., `feat`, `fix`, `docs`). This helps you understand the project's commit hygiene and can guide your commit message generation.
    *   `aiCommands`: Mappings of conversational trigger phrases to `npm` commands. This section is particularly important for understanding how the project expects AI agents to execute specific actions.

3.  **Prioritize Structured Data:** Whenever possible, extract information directly from the compiled JSON output of `project_graph.jsonnet` rather than relying on natural language descriptions in READMEs or comments. This provides the most precise and unambiguous context.

4.  **Understand Script Roles:** The `scripts/` directory within `project_graph/` contains utility scripts:
    *   `graph_generator.mjs`: Compiles the Jsonnet graph, attaches an `observed` graph via adapters, computes drift, writes snapshots and events, generates diagrams, and updates README sections.
    *   `ai_committer.mjs`: Automates Git commits based on `commitGroups`, creating atomic commits per group for parent-project files; commits project_graph and AI rule files separately.
    *   `sync_ai_commands.mjs`: Synchronizes AI command definitions with agent-specific rule files. Appends a synced section with timestamps.
    *   `graph_validator.mjs`: Validates the compiled graph against the schema and checks platform mappings.

5.  **Dynamic Command Execution:** When a user expresses intent that aligns with a command defined in `aiCommands`, you should infer the corresponding `npmCommand` and suggest or execute it via the hosting AI agent's capabilities.

6.  **Drift and Plans Awareness:** Prefer the compiled `project_graph/.cache/graph.json`. It includes `observed` (adapter output) and `drift`. Reference `memory-bank/plans/` markdown for human-facing plan summaries; edit `graph_parts/plans.jsonnet` for canonical plan definitions.

## Your Role in Maintaining This System:

*   **Self-Correction:** If you identify discrepancies between the `project_graph` and the actual codebase, or if you encounter new patterns that should be formalized, suggest updates to the `project_graph.jsonnet`.
*   **Proactive Use:** Actively query and integrate information from the `project_graph` into your reasoning processes for all tasks related to this project.

By leveraging the `project_graph` system, you can become a more effective, context-aware, and integrated collaborator within the `tsx_viewer` project.