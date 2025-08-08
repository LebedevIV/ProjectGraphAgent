// project_graph.jsonnet
// Version: 1.7
// Root file for the project graph. It imports and assembles all modular parts.

{
    schemaVersion: '1.7',
    projectName: 'tsx_viewer',
    projectUrl: 'https://github.com/01esyaLebedeva/tsx_viewer',
    description: 'TSX viewer and editor application, supporting both web and Electron environments.',

    meta: (import 'graph_parts/meta.jsonnet'),

    entities: import 'graph_parts/entities.jsonnet',

    // Relationships between entities
    relations: import 'graph_parts/relations.jsonnet',

    // Policies and conventions
    policies: import 'graph_parts/policies.jsonnet',

    // AI Command Mappings
    aiCommands: import 'graph_parts/ai_commands.jsonnet',

    templates: import 'graph_parts/templates.jsonnet',

    // Plans/Roadmaps
    plans: import 'graph_parts/plans.jsonnet',

    // Re-export commit groups from policies for unified source of truth
    commitGroups: (import 'graph_parts/policies.jsonnet').commitGroups,
}