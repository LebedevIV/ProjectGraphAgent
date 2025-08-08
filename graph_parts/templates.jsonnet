// graph_parts/templates.jsonnet
// This part defines reusable templates for creating entities and centralized defaults.

{
    Metadata(confidence, author, notes=''):: {
        confidence: confidence,
        author: author,
        timestamp: std.extVar('timestamp'),
        notes: notes,
    },

    // Centralized defaults for the graph system
    Defaults: {
        defaultConfidence: 0.9,
        defaultAuthor: 'project-graph',
        defaultNotes: 'generated or templated',
    },

    DefaultMetadata(confidence=null, author=null, notes=null):: self.Metadata(
        if confidence == null then self.Defaults.defaultConfidence else confidence,
        if author == null then self.Defaults.defaultAuthor else author,
        if notes == null then self.Defaults.defaultNotes else notes,
    ),

    Component(name, path, purpose, props=[], state=[], dependencies=[], interactions=[], metadata):: {
        type: 'ReactComponent',
        name: name,
        path: path,
        purpose: purpose,
        props: props,
        state: state,
        dependencies: dependencies,
        interactions: interactions,
        metadata: metadata,
    },

    FileEntity(kind, path, purpose, metadata, domain=null, layer=null, tags=[], owner=null, criticality='low'):: {
        type: kind,
        path: path,
        purpose: purpose,
        metadata: metadata,
        domain: domain,
        layer: layer,
        tags: tags,
        owner: owner,
        criticality: criticality,
    },

    IpcChannel(direction, purpose, payload={}, metadata):: {
        type: 'IPCChannel',
        direction: direction,
        purpose: purpose,
        payload: payload,
        metadata: metadata,
    },

    ProjectSettings(auditAfterCommit=false, updateMemoryBankOnAudit=false, keepCompiledGraph=true, auditExcludePatterns=["**/*.map", "**/*.log"], auditChangedOnly=false, adapters={ typescript: { enabled: true }, python: { enabled: false } }):: {
        settingsFileMetadata: {
            fileName: 'settings.json',
            filePath: 'project_graph/settings.json', // Relative to project root
            description: 'Configuration file for project-specific settings, including AI agent behaviors.',
        },
        options: {
            audit_after_commit: {
                value: auditAfterCommit,
                description: 'Automatically run a focused audit on committed files after each `graph:commit` operation.',
            },
            update_memory_bank_on_audit: {
                value: updateMemoryBankOnAudit,
                description: 'Log audit results to the memory-bank/audit_logs.md file.',
            },
            keep_compiled_graph: {
                value: keepCompiledGraph,
                description: 'Keep the compiled graph JSON at project_graph/.cache/graph.json after the generator finishes.',
            },
            audit_exclude_patterns: {
                value: auditExcludePatterns,
                description: 'Glob patterns to exclude from audits (applied to POSIX-style relative paths).',
            },
            audit_changed_only: {
                value: auditChangedOnly,
                description: 'Audit only files changed vs HEAD to speed up local workflows.',
            },
            adapters: {
                value: adapters,
                description: 'Language adapters to populate observed graph (typescript, python).',
            },
        },
    },
}