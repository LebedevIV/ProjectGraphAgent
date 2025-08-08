#!/usr/bin/env node

/**
 * ProjectGraphAgent Cleaner
 * 
 * This script cleans the ProjectGraphAgent from any parent project data
 * and prepares it for standalone publication.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Files that should be cleaned/templated
const CLEANUP_TARGETS = {
    'project_graph.jsonnet': {
        description: 'Root project configuration',
        template: `// project_graph.jsonnet
// Version: 1.7
// Root file for the project graph. It imports and assembles all modular parts.

{
    schemaVersion: '1.7',
    projectName: 'your-project-name',
    projectUrl: 'https://github.com/your-username/your-project',
    description: 'Your project description here.',

    meta: (import 'graph_parts/meta.jsonnet'),

    entities: import 'graph_parts/entities.jsonnet',

    // Relationships between entities
    relations: import 'graph_parts/relations.jsonnet',

    // Policies and conventions
    policies: import 'graph_parts/policies.jsonnet'),

    // AI Command Mappings
    aiCommands: import 'graph_parts/ai_commands.jsonnet',

    templates: import 'graph_parts/templates.jsonnet',

    // Plans/Roadmaps
    plans: import 'graph_parts/plans.jsonnet',

    // Re-export commit groups from policies for unified source of truth
    commitGroups: (import 'graph_parts/policies.jsonnet').commitGroups,
}`
    },
    'graph_parts/entities.jsonnet': {
        description: 'Project entities definition',
        template: `// graph_parts/entities.jsonnet
// This part defines the core entities of the project.

local templates = import 'templates.jsonnet';
local Metadata = templates.Metadata;
local Component = templates.Component;
local IpcChannel = templates.IpcChannel;
local FileEntity = templates.FileEntity;
local DefaultMetadata = templates.DefaultMetadata;

{
    // --- Config & Manifest Files ---
    'package.json': FileEntity(
        'PackageManagementFile',
        'package.json',
        'Defines project metadata, scripts, dependencies, and build configurations.',
        Metadata(1.0, 'Gemini-1.5-Pro')
    ) + {
        sections: [
            { name: 'scripts', purpose: 'Defines command-line scripts for development, building, and starting the app.' },
            { name: 'dependencies', purpose: 'Lists runtime libraries required by the application.' },
            { name: 'devDependencies', purpose: 'Lists libraries needed for development and building, but not for runtime.' },
            { name: 'build', purpose: 'Configuration for electron-builder to package the application for different OS.' },
        ],
    },

    // --- Project Graph System Files ---
    'ProjectGraphAgent/project_graph.jsonnet': FileEntity(
        'JsonnetConfiguration',
        'ProjectGraphAgent/project_graph.jsonnet',
        'Root configuration file for the project graph system.',
        DefaultMetadata()
    ),
    'ProjectGraphAgent/README.md': FileEntity(
        'Documentation',
        'ProjectGraphAgent/README.md',
        'Main documentation for the project graph system.',
        DefaultMetadata()
    ),
    'ProjectGraphAgent/LLM_GUIDELINES.md': FileEntity(
        'Documentation',
        'ProjectGraphAgent/LLM_GUIDELINES.md',
        'Guidelines for Large Language Models on how to interpret and utilize the project graph system.',
        DefaultMetadata()
    ),

    // --- Example Source Files (replace with your project's files) ---
    'src/App.tsx': Component(
        name='App.tsx',
        path='src/App.tsx',
        purpose='The main application component, defines the overall layout and routes.',
        metadata=DefaultMetadata()
    ),
    'src/main.tsx': FileEntity(
        kind='EntryPoint',
        path='src/main.tsx',
        purpose='The main entry point for the React application.',
        metadata=DefaultMetadata()
    ),
    'src/index.css': FileEntity(
        kind='Styling',
        path='src/index.css',
        purpose='Global CSS styles for the application.',
        metadata=DefaultMetadata()
    ),

    // --- Example Test Files ---
    'test/example.test.tsx': FileEntity(
        kind='TestFile',
        path='test/example.test.tsx',
        purpose='Example test file for React components.',
        metadata=DefaultMetadata()
    ),

    // --- Example Public Files ---
    'public/index.html': FileEntity(
        kind='HTML',
        path='public/index.html',
        purpose='The main HTML file for the application.',
        metadata=DefaultMetadata()
    ),

    // --- Example Configuration Files ---
    'tsconfig.json': FileEntity(
        kind='TypeScriptConfiguration',
        path='tsconfig.json',
        purpose='TypeScript configuration file.',
        metadata=DefaultMetadata()
    ),
    '.gitignore': FileEntity(
        kind='GitConfiguration',
        path='.gitignore',
        purpose='Git ignore rules for the project.',
        metadata=DefaultMetadata()
    ),
    'README.md': FileEntity(
        kind='Documentation',
        path='README.md',
        purpose='Main project documentation.',
        metadata=DefaultMetadata()
    ),
}`
    }
};

// Files to remove (parent project specific)
const FILES_TO_REMOVE = [
    '.cache/',
    'memory-bank/',
    'settings.json'
];

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function cleanFile(filePath, template) {
    try {
        const fullPath = path.join(PROJECT_ROOT, filePath);
        fs.writeFileSync(fullPath, template);
        log(`Cleaned: ${filePath}`, 'success');
        return true;
    } catch (error) {
        log(`Failed to clean ${filePath}: ${error.message}`, 'error');
        return false;
    }
}

function removeFile(filePath) {
    try {
        const fullPath = path.join(PROJECT_ROOT, filePath);
        if (fs.existsSync(fullPath)) {
            if (fs.statSync(fullPath).isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(fullPath);
            }
            log(`Removed: ${filePath}`, 'success');
            return true;
        }
        return false;
    } catch (error) {
        log(`Failed to remove ${filePath}: ${error.message}`, 'error');
        return false;
    }
}

function updatePackageJson() {
    try {
        const packagePath = path.join(PROJECT_ROOT, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Update project metadata
            packageJson.name = 'project-graph-agent';
            packageJson.description = 'Jsonnet-driven project control system for AI agents';
            packageJson.repository = {
                type: 'git',
                url: 'https://github.com/LebedevIV/ProjectGraphAgent.git'
            };
            packageJson.keywords = ['ai', 'agents', 'project-management', 'jsonnet', 'graph'];
            packageJson.author = 'Igor Lebedev';
            packageJson.license = 'MIT';
            
            // Update scripts
            packageJson.scripts = {
                ...packageJson.scripts,
                'clean': 'node scripts/clean_project.mjs',
                'graph:audit': 'node scripts/graph_generator.mjs',
                'graph:validate': 'node scripts/graph_validator.mjs',
                'graph:commit': 'node scripts/ai_committer.mjs',
                'sync:ai-commands': 'node scripts/sync_ai_commands.mjs'
            };
            
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            log('Updated: package.json', 'success');
            return true;
        }
        return false;
    } catch (error) {
        log(`Failed to update package.json: ${error.message}`, 'error');
        return false;
    }
}

function createGitIgnore() {
    const gitignoreContent = `# ProjectGraphAgent specific
.cache/
memory-bank/
settings.json

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
`;
    
    try {
        const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
        fs.writeFileSync(gitignorePath, gitignoreContent);
        log('Created: .gitignore', 'success');
        return true;
    } catch (error) {
        log(`Failed to create .gitignore: ${error.message}`, 'error');
        return false;
    }
}

function main() {
    log('Starting ProjectGraphAgent cleanup...');
    
    let successCount = 0;
    let totalCount = 0;
    
    // Clean template files
    for (const [filePath, config] of Object.entries(CLEANUP_TARGETS)) {
        totalCount++;
        if (cleanFile(filePath, config.template)) {
            successCount++;
        }
    }
    
    // Remove parent project specific files
    for (const filePath of FILES_TO_REMOVE) {
        totalCount++;
        if (removeFile(filePath)) {
            successCount++;
        }
    }
    
    // Update package.json
    totalCount++;
    if (updatePackageJson()) {
        successCount++;
    }
    
    // Create .gitignore
    totalCount++;
    if (createGitIgnore()) {
        successCount++;
    }
    
    log(`Cleanup completed: ${successCount}/${totalCount} operations successful`);
    
    if (successCount === totalCount) {
        log('ProjectGraphAgent is now clean and ready for publication!', 'success');
        log('Next steps:');
        log('1. Review the cleaned files');
        log('2. Customize project_graph.jsonnet with your project details');
        log('3. Commit and push to GitHub');
    } else {
        log('Some operations failed. Please review the errors above.', 'error');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
