// scripts/graph_validator.mjs
import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const PROJECT_GRAPH_DIR = path.join(PROJECT_ROOT, 'project_graph');
const CACHE_DIR = path.join(PROJECT_GRAPH_DIR, '.cache');
const COMPILED_GRAPH = path.join(CACHE_DIR, 'graph.json');

async function validateGraph() {
    console.log('\n--- Starting Project Graph Validation ---');
    let graph;
    try {
        graph = JSON.parse(await fs.readFile(COMPILED_GRAPH, 'utf-8'));
    } catch (error) {
        console.error(`Error reading compiled graph.json: ${error.message}`);
        console.error('Please ensure project_graph/.cache/graph.json exists and is valid JSON. Run the generator first: `node project_graph/scripts/graph_generator.mjs --keep-compiled`.');
        process.exit(1);
    }

    const errors = [];

    // Load schema from graph if present
    const schema = graph.schema || {};
    const allowedTypes = new Set(schema.entityTypes || []);
    const requiredByType = schema.requiredFieldsByType || {};

    // 1. Validate Entities
    const entityPaths = new Set();
    for (const key in graph.entities) {
        const entity = graph.entities[key];
        if (!entity.type) errors.push(`Entity '${key}' is missing a 'type'.`);
        if (entity.type && allowedTypes.size && !allowedTypes.has(entity.type)) errors.push(`Entity '${key}' has unknown type '${entity.type}'.`);
        if (!entity.path) {
            errors.push(`Entity '${key}' is missing a 'path'.`);
        }
        if (!entity.purpose) {
            errors.push(`Entity '${key}' is missing a 'purpose'.`);
        }
        const required = requiredByType[entity.type] || requiredByType['default'] || [];
        for (const field of required) {
            if (!(field in entity)) errors.push(`Entity '${key}' is missing required field '${field}' by schema.`);
        }
        if (entityPaths.has(entity.path)) {
            errors.push(`Duplicate entity path found: '${entity.path}'.`);
        }
        entityPaths.add(entity.path);
    }

    // 2. Validate Relations
    if (graph.relations) {
        for (const key in graph.relations) {
            const relation = graph.relations[key];
            if (!relation.from || !graph.entities[relation.from]) {
                errors.push(`Relation '${key}' has an invalid or missing 'from' entity: '${relation.from}'.`);
            }
            if (!relation.to || !graph.entities[relation.to]) {
                errors.push(`Relation '${key}' has an invalid or missing 'to' entity: '${relation.to}'.`);
            }
            if (!relation.type) {
                errors.push(`Relation '${key}' is missing a 'type'.`);
            }
        }
    }

    // Validate platform config paths for AI commands
    const platforms = graph.aiCommands && graph.aiCommands.platforms;
    if (platforms) {
        for (const [k, platform] of Object.entries(platforms)) {
            if (!platform || !platform.configPath) continue;
            const full = path.join(PROJECT_ROOT, platform.configPath);
            try {
                await fs.access(full);
            } catch {
                console.warn(`AI platform config missing: ${platform.name} (${platform.configPath})`);
            }
        }
    }

    if (errors.length > 0) {
        console.error('\nValidation FAILED with the following errors:');
        errors.forEach(err => console.error(`- ${err}`));
        process.exit(1);
    } else {
        console.log('\nValidation SUCCESS: Project graph is structurally sound.');
    }
    console.log('----------------------------------');
}

validateGraph().catch(error => {
    console.error('Project Graph Validation failed unexpectedly:', error);
    process.exit(1);
});