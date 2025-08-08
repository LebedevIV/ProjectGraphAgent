# AgentGraph (early alpha)

AgentGraph is a Jsonnet-driven project control system for AI agents (Cursor, Gemini, Claude, Roo, Kilocode). It documents architecture, tracks drift, generates diagrams, groups commits, and produces agent-friendly artifacts.

- Declared vs Observed: Jsonnet "declared" model + adapters "observed" model → drift
- Outputs for agents: compiled graph JSON, drift report, Mermaid diagrams, plans markdown, snapshots and events
- Automation: grouped commits, AI command sync, CI workflow

## Requirements
- Node.js 18+
- Jsonnet CLI (`jsonnet` in PATH)

## Quick start (embed into any project)
1) Copy the `project_graph/` folder into your repository root
2) Ensure Jsonnet is installed (Linux: `apt install jsonnet`, macOS: `brew install jsonnet`)
3) (Optional) Add npm scripts in your `package.json`:
```json
{
  "scripts": {
    "graph:audit": "node project_graph/scripts/graph_generator.mjs",
    "graph:validate": "node project_graph/scripts/graph_validator.mjs",
    "graph:commit": "node project_graph/scripts/ai_committer.mjs",
    "sync:ai-commands": "node project_graph/scripts/sync_ai_commands.mjs"
  }
}
```
4) Run the generator:
```bash
node project_graph/scripts/graph_generator.mjs --keep-compiled
```
Artifacts:
- `project_graph/.cache/graph.json` (includes observed + drift)
- `memory-bank/diagrams/graph.mmd`
- `memory-bank/drift.md`
- `memory-bank/plans/` (markdown per-domain + digest)

## CI (GitHub Actions)
Add this job to `.github/workflows/*.yml`:
```yaml
- name: Generate Graph
  run: node project_graph/scripts/graph_generator.mjs --keep-compiled
- name: Validate Graph
  run: node project_graph/scripts/graph_validator.mjs
```

## Core concepts
- Jsonnet graph: `project_graph.jsonnet` imports `graph_parts/*`
- Observed graph: adapters (`adapters/typescript.mjs`, `adapters/python.mjs`)
- Drift: computed automatically; summarized in README and memory-bank
- Plans: defined in Jsonnet, emitted as markdown, tracked by agents

## Alpha caveats
- Adapters are heuristic (basic import scans)
- Drift is entity-level; relation severity is TBD
- Policies are shape/schema-level; rule DSL coming later

## License
Inherits the repository license (GPL-3.0-or-later by default).
