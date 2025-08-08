// graph_parts/meta.jsonnet
// This part defines the graph's own structure and rules.

{
    description: 'This section is self-referential. It defines the structure and usage policies of the project_graph.jsonnet file itself, enabling any AI to understand how to interpret it.',
    
    entities: {
      'project_graph.jsonnet': {
        type: 'MetaGraphFile',
        purpose: 'The root file that imports all graph parts to provide a holistic, machine-readable representation of the project.',
      },
      'graph_parts/': {
        type: 'MetaDirectory',
        purpose: 'Contains the modular parts of the project graph.',
      },
      'project_graph/scripts/graph_generator.mjs': {
        type: 'UtilityScript',
        purpose: 'Compiles the Jsonnet graph, writes compiled JSON to a cache for AI agents, updates README sections, and audits against the file system.',
        interactions: [
            { type: 'EXECUTES', target: 'jsonnet' },
            { type: 'READS', target: 'project_graph.jsonnet' },
            { type: 'SCANS', target: 'FileSystem' },
            { type: 'WRITES', target: 'project_graph/.cache/graph.json' },
        ],
      },
      'project_graph/scripts/graph_validator.mjs': {
        type: 'UtilityScript',
        purpose: 'Validates the compiled graph against the schema and checks referenced platform config files.',
        interactions: [
            { type: 'READS', target: 'project_graph/.cache/graph.json' },
            { type: 'READS', target: 'graph_parts/schema.jsonnet' },
            { type: 'SCANS', target: 'FileSystem' },
        ],
      },
      'graph_parts/templates.jsonnet': {
        type: 'MetaTemplateFile',
        purpose: 'Defines reusable helper functions (templates) for creating entities within the graph, ensuring consistency.',
      },
      'metadata_block': {
        type: 'MetaConcept',
        purpose: 'A block attached to an entity to describe the confidence, authorship, and rationale of the information presented.',
      },
    },
    
    // TODO: Consider adding a dedicated schema block for validation.
}