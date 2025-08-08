// graph_parts/ai_commands.jsonnet
// This file defines mappings for AI assistant commands.

{
    // Define commands that can be triggered by AI assistants
    commands: [
        {
            name: 'graph-audit',
            npmCommand: 'node project_graph/scripts/graph_generator.mjs',
            description: 'Executes the project graph audit script to check for discrepancies between the graph definition and actual project files.',
            implemented: true,
            triggerPhrases: [
                'graph-audit',
                'audit graph',
                'check graph',
                'run audit',
            ],
        },
        {
            name: 'graph-commit',
            npmCommand: 'npm run graph:commit',
            description: 'Executes the AI Committer script to automatically categorize and commit staged changes based on project_graph.jsonnet rules.',
            implemented: false, // planned
            triggerPhrases: [
                'graph-commit',
                'commit graph',
                'auto commit',
                'run committer',
            ],
        },
        {
            name: 'sync-ai-commands',
            npmCommand: 'npm run sync:ai-commands',
            description: 'Synchronizes AI command definitions across various AI assistant rule files.',
            implemented: false, // planned
            triggerPhrases: [
                'sync-ai-commands',
                'sync ai',
                'update ai rules',
                'sync assistant commands',
            ],
        },
    ],

    // Define how these commands should be presented for different AI platforms
    platforms: {
        gemini: {
            name: 'Gemini Code Assistant',
            configPath: '.gemini/GEMINI.md',
        },
        cursor: {
            name: 'Cursor',
            configPath: '.cursor/rules/general-rules.mdc',
        },
        roo: {
            name: 'Roo',
            configPath: '.roo/rules/rules.md',
        },
        kilocode: {
            name: 'Kilocode',
            configPath: '.kilocode/rules/general-rules.md',
        },
    },
}
