// scripts/graph_generator.mjs
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import minimatch from 'minimatch';

const PROJECT_ROOT = process.cwd();
const PROJECT_GRAPH_DIR = path.join(PROJECT_ROOT, 'project_graph');
const GRAPH_SOURCE = path.join(PROJECT_GRAPH_DIR, 'project_graph.jsonnet');
const CACHE_DIR = path.join(PROJECT_GRAPH_DIR, '.cache');
const COMPILED_GRAPH = path.join(CACHE_DIR, 'graph.json');
const AUDIT_DIRECTORIES = ['src', 'electron', 'test', 'public'];
const README_PATH = path.join(PROJECT_GRAPH_DIR, 'README.md');
const SETTINGS_PATH = path.join(PROJECT_GRAPH_DIR, 'settings.json');
const MEMORY_BANK_DIR = path.join(PROJECT_ROOT, 'memory-bank');
const HISTORY_DIR = path.join(PROJECT_GRAPH_DIR, '.cache', 'history');
const EVENTS_LOG = path.join(PROJECT_GRAPH_DIR, '.cache', 'events.ndjson');
const PLANS_DIR = path.join(PROJECT_ROOT, 'memory-bank', 'plans');
const DIAGRAMS_DIR = path.join(PROJECT_ROOT, 'memory-bank', 'diagrams');
const ADAPTERS_DIR = path.join(PROJECT_GRAPH_DIR, 'adapters');

// Function to run shell commands
const run = (cmd, options = {}) => new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout, stderr) => {
        if (error) {
            console.error(`Command failed: ${cmd}\nError: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`);
            return reject(error);
        }
        resolve(stdout.trim());
    });
});

async function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            await getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.relative(PROJECT_ROOT, fullPath));
        }
    }
    return arrayOfFiles;
}

async function generateSettingsFile(graph) {
    console.log('Checking for project_graph/settings.json...');
    const settingsFilePath = path.join(PROJECT_GRAPH_DIR, 'settings.json');

    try {
        await fs.access(settingsFilePath);
        console.log('project_graph/settings.json already exists. Skipping generation.');
    } catch (error) {
        console.log('project_graph/settings.json not found. Generating default settings...');
        
        // Compile default settings from Jsonnet, since functions are not preserved in compiled JSON
        const jsonnetSnippet = "local templates = import 'graph_parts/templates.jsonnet'; templates.ProjectSettings()";
        let defaultSettings;
        try {
            const compiledSettings = await run(`jsonnet -J ${PROJECT_GRAPH_DIR} -e "${jsonnetSnippet}"`);
            defaultSettings = JSON.parse(compiledSettings);
        } catch (jsonnetError) {
            console.error(`Error compiling Jsonnet for default settings: ${jsonnetError.message}`);
            throw jsonnetError;
        }

        let updateMemoryBankOnAuditOption = { ...defaultSettings.options.update_memory_bank_on_audit };

        try {
            const stats = await fs.stat(MEMORY_BANK_DIR);
            if (stats.isDirectory()) {
                updateMemoryBankOnAuditOption.value = true; // Set to true if memory-bank directory exists
                console.log('Memory-bank directory detected. Setting update_memory_bank_on_audit to true.');
            }
        } catch (memBankError) {
            console.log('Memory-bank directory not found. update_memory_bank_on_audit remains default.');
        }

        const settingsContent = JSON.stringify({
            settingsFileMetadata: defaultSettings.settingsFileMetadata,
            options: {
                audit_after_commit: defaultSettings.options.audit_after_commit,
                update_memory_bank_on_audit: updateMemoryBankOnAuditOption,
                keep_compiled_graph: defaultSettings.options.keep_compiled_graph || { value: true, description: 'Keep the compiled graph JSON at project_graph/.cache/graph.json' },
                audit_exclude_patterns: defaultSettings.options.audit_exclude_patterns || { value: ["**/*.map", "**/*.log"], description: 'Glob patterns to exclude from audits' },
            },
        }, null, 2);

        await fs.writeFile(settingsFilePath, settingsContent);
        console.log(`Generated default settings file at ${settingsFilePath}`);
    }
}

async function generateReadme(graph) {
    let existingReadmeContent = '';
    try {
        existingReadmeContent = await fs.readFile(README_PATH, 'utf-8');
    } catch (error) {
        console.warn(`Could not read existing README.md: ${error.message}. Creating new one.`);
    }

    // Generate Structure Section
    let structureSection = '\n## Structure\n\n';
    structureSection += '*   `project_graph.jsonnet`\n';
    structureSection += '    *   The root file that assembles the entire graph, including project metadata, entities, relations, policies, and commit grouping rules.\n';
    structureSection += '*   `graph_parts/`\n';
    structureSection += '    *   `entities.jsonnet`: Defines all the core components, files, and resources of the project.\n';
    structureSection += '    *   `relations.jsonnet`: Defines the relationships *between* the entities (e.g., which component uses which, IPC channels).\n';
    structureSection += '    *   `templates.jsonnet`: Reusable schemas for different types of entities.\n';
    structureSection += '    *   `policies.jsonnet`: Defines architectural rules and conventions for the project.\n';
    structureSection += '    *   `meta.jsonnet`: Contains metadata about the project graph itself.\n';
    structureSection += '    *   `ai_commands.jsonnet`: Defines mappings for AI assistant commands.\n';
    structureSection += '*   `scripts/`\n';

    const scriptFiles = await fs.readdir(path.join(PROJECT_GRAPH_DIR, 'scripts'));
    for (const scriptFile of scriptFiles.sort()) {
        const scriptPath = `project_graph/scripts/${scriptFile}`;
        let description = 'A script related to the project graph.';
        if (scriptFile === 'graph_generator.mjs') {
            description = 'The script that generates this README and compares the graph to the live project files and reports any drift.';
        } else if (scriptFile === 'ai_committer.mjs') {
            description = 'The script that automates the creation of categorized Git commits based on the `commitGroups` defined in `project_graph.jsonnet`.';
        } else if (scriptFile === 'sync_ai_commands.mjs') {
            description = 'The script that synchronizes AI command definitions across various AI assistant rule files.';
        } else if (scriptFile === 'graph_validator.mjs') {
            description = '(Future) A script to validate the graph against the policies defined in `policies.jsonnet`.';
        }
        structureSection += `    *   \`${scriptFile}\`: ${description}\n`;
    }
    structureSection += '\n';

    const structureSectionHeader = '## Structure';
    const structureStartIndex = existingReadmeContent.indexOf(structureSectionHeader);
    let newReadmeContent = existingReadmeContent;

    if (structureStartIndex !== -1) {
        const structureEndIndex = existingReadmeContent.indexOf('\n## ', structureStartIndex + structureSectionHeader.length);
        if (structureEndIndex !== -1) {
            newReadmeContent = existingReadmeContent.substring(0, structureStartIndex) + structureSection + existingReadmeContent.substring(structureEndIndex);
        } else {
            newReadmeContent = existingReadmeContent.substring(0, structureStartIndex) + structureSection;
        }
    } else {
        // If structure section doesn't exist, append it after the Purpose section
        const purposeSectionHeader = '## Purpose';
        const purposeStartIndex = existingReadmeContent.indexOf(purposeSectionHeader);
        if (purposeStartIndex !== -1) {
            const purposeEndIndex = existingReadmeContent.indexOf('\n## ', purposeStartIndex + purposeSectionHeader.length);
            if (purposeEndIndex !== -1) {
                newReadmeContent = existingReadmeContent.substring(0, purposeEndIndex) + structureSection + existingReadmeContent.substring(purposeEndIndex);
            } else {
                newReadmeContent = existingReadmeContent + structureSection;
            }
        } else {
            newReadmeContent = structureSection + existingReadmeContent; // Fallback if Purpose section also not found
        }
    }

    let aiCommandsSection = '\n## AI Assistant Command Mapping\n\n';
    aiCommandsSection += 'To streamline interaction with AI assistants, you can configure them to trigger `npm run graph:audit` and `npm run graph:commit` using simpler, more conversational commands. Below are examples of how to set this up for various AI assistants, based on the definitions in `graph_parts/ai_commands.jsonnet`.\n\n';
    aiCommandsSection += '**Important:** The exact syntax and capabilities may vary between AI assistants. Refer to your specific AI\'s documentation for precise configuration details.\n\n';

    if (graph.aiCommands && graph.aiCommands.platforms) {
        for (const platformKey in graph.aiCommands.platforms) {
            const platform = graph.aiCommands.platforms[platformKey];
            const configAbsolutePath = path.join(PROJECT_ROOT, platform.configPath);
            try {
                await fs.access(configAbsolutePath);
            } catch (error) {
                console.warn(`Skipping AI command mapping for ${platform.name}: Config file not found at ${platform.configPath}`);
                continue; // Skip this platform if config file doesn't exist
            }
            aiCommandsSection += `### For ${platform.name} (\`${platform.configPath}\`)\n\n`;
            aiCommandsSection += '```markdown\n';
            for (const cmd of graph.aiCommands.commands) {
                let line = '';
                if (platformKey === 'gemini') {
                    const triggerPhrasesJoined = cmd.triggerPhrases.map(p => `\"${p}\"`).join(" or ");
                    line = `- **Command Aliases:** When the user requests ${triggerPhrasesJoined}, execute \`${cmd.npmCommand}\`.`;
                } else {
                    line = `## ${cmd.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}\n- **Trigger Phrase:** \"${cmd.triggerPhrases[0]}\"\n- **Action:** Run \`${cmd.npmCommand}\`\n- **Description:** ${cmd.description}\n`;
                }
                aiCommandsSection += line + '\n';
            }
            aiCommandsSection += '```\n\n';
        }
    }

    const aiSectionHeader = '## AI Assistant Command Mapping';
    const aiStartIndex = newReadmeContent.indexOf(aiSectionHeader);

    if (aiStartIndex !== -1) {
        const aiEndIndex = newReadmeContent.indexOf('\n## ', aiStartIndex + aiSectionHeader.length);
        if (aiEndIndex !== -1) {
            newReadmeContent = newReadmeContent.substring(0, aiStartIndex) + aiCommandsSection + newReadmeContent.substring(aiEndIndex);
        } else {
            newReadmeContent = newReadmeContent.indexOf(0, aiStartIndex) + aiCommandsSection;
        }
    } else {
        newReadmeContent += aiCommandsSection;
    }

    await fs.writeFile(README_PATH, newReadmeContent);
    console.log(`Generated ${README_PATH}`);
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function appendEvent(event) {
    try {
        await ensureDir(path.dirname(EVENTS_LOG));
        await fs.appendFile(EVENTS_LOG, JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n');
    } catch {}
}

async function snapshotGraph() {
    try {
        await ensureDir(HISTORY_DIR);
        const ts = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 14);
        const target = path.join(HISTORY_DIR, `graph-${ts}.json`);
        await fs.copyFile(COMPILED_GRAPH, target);
    } catch {}
}

async function writePlansMarkdown(graph) {
    if (!graph.plans || !graph.plans.plans) return;
    const plans = graph.plans.plans;
    const byDomain = {};
    for (const [planId, plan] of Object.entries(plans)) {
        const domain = plan.domain || 'general';
        if (!byDomain[domain]) byDomain[domain] = [];
        byDomain[domain].push({ id: planId, ...plan });
    }
    await ensureDir(PLANS_DIR);
    // Global digest
    const digest = ['# Plans Digest', '', `Generated: ${new Date().toISOString()}`, ''];
    for (const [domain, list] of Object.entries(byDomain)) {
        digest.push(`## ${domain}`);
        for (const p of list) digest.push(`- ${p.id}: ${p.title} [${p.status}]`);
        digest.push('');
    }
    await fs.writeFile(path.join(PLANS_DIR, 'README.md'), digest.join('\n'));

    // Per-domain files
    for (const [domain, list] of Object.entries(byDomain)) {
        const dir = path.join(PLANS_DIR, domain);
        await ensureDir(dir);
        for (const p of list) {
            const lines = [];
            lines.push(`# ${p.title}`);
            lines.push('');
            lines.push(`- id: ${p.id}`);
            lines.push(`- status: ${p.status}`);
            if (p.owners && p.owners.length) lines.push(`- owners: ${p.owners.join(', ')}`);
            if (p.rationale) lines.push(`- rationale: ${p.rationale}`);
            if (p.relatedEntities && p.relatedEntities.length) lines.push(`- relatedEntities: ${p.relatedEntities.join(', ')}`);
            if (p.links && p.links.length) lines.push(`- links:`), p.links.forEach(l => lines.push(`  - ${l}`));
            if (p.milestones && p.milestones.length) {
                lines.push('');
                lines.push('## Milestones');
                for (const m of p.milestones) lines.push(`- [${m.status}] ${m.id}: ${m.title}`);
            }
            await fs.writeFile(path.join(dir, `${p.id}.md`), lines.join('\n'));
        }
    }
}

async function runAdapters(graph) {
    const observed = { entities: {}, relations: {} };
    let settings = null;
    try {
        settings = JSON.parse(await fs.readFile(SETTINGS_PATH, 'utf-8'));
    } catch {}
    const adapters = (settings && settings.options && settings.options.adapters && settings.options.adapters.value) || { typescript: { enabled: true }, python: { enabled: false } };
    const results = [];
    if (adapters.typescript && adapters.typescript.enabled) {
        try {
            const mod = await import(path.join(ADAPTERS_DIR, 'typescript.mjs'));
            results.push(await mod.extract({ projectRoot: PROJECT_ROOT }));
        } catch (e) { console.warn('TS adapter failed:', e.message); }
    }
    if (adapters.python && adapters.python.enabled) {
        try {
            const mod = await import(path.join(ADAPTERS_DIR, 'python.mjs'));
            results.push(await mod.extract({ projectRoot: PROJECT_ROOT }));
        } catch (e) { console.warn('Python adapter failed:', e.message); }
    }
    for (const r of results) {
        Object.assign(observed.entities, r.entities || {});
        Object.assign(observed.relations, r.relations || {});
    }
    return observed;
}

function computeDrift(declared, observed) {
    const declaredKeys = new Set(Object.keys(declared || {}));
    const observedKeys = new Set(Object.keys(observed || {}));
    const observedNotDeclared = [];
    const declaredNotObserved = [];
    for (const k of observedKeys) if (!declaredKeys.has(k)) observedNotDeclared.push(k);
    for (const k of declaredKeys) if (!observedKeys.has(k)) declaredNotObserved.push(k);
    return { observedNotDeclared, declaredNotObserved };
}

async function writeDriftArtifacts(compiledPath) {
    try {
        const compiled = JSON.parse(await fs.readFile(compiledPath, 'utf-8'));
        const declared = compiled.entities || {};
        const observed = (compiled.observed && compiled.observed.entities) || {};
        const drift = computeDrift(declared, observed);
        compiled.drift = drift;
        await fs.writeFile(compiledPath, JSON.stringify(compiled, null, 2));

        // memory-bank drift summary
        const out = [];
        out.push('# Graph Drift');
        out.push('');
        out.push(`Generated: ${new Date().toISOString()}`);
        out.push('');
        out.push(`- observedNotDeclared: ${drift.observedNotDeclared.length}`);
        out.push(`- declaredNotObserved: ${drift.declaredNotObserved.length}`);
        out.push('');
        out.push('## Samples');
        out.push('');
        drift.observedNotDeclared.slice(0, 20).forEach(k => out.push(`- observed only: ${k}`));
        drift.declaredNotObserved.slice(0, 20).forEach(k => out.push(`- declared only: ${k}`));
        await ensureDir(path.join(MEMORY_BANK_DIR));
        await fs.writeFile(path.join(MEMORY_BANK_DIR, 'drift.md'), out.join('\n'));
        return drift;
    } catch (e) {
        console.warn('Failed to write drift artifacts:', e.message);
        return null;
    }
}

async function writeRelationsDiagram(compiledPath) {
    try {
        const compiled = JSON.parse(await fs.readFile(compiledPath, 'utf-8'));
        const rels = compiled.relations || {};
        const observedRels = (compiled.observed && compiled.observed.relations) || {};
        const lines = ['graph LR'];
        const addEdge = (from, to, label) => {
            const f = (from || '').replace(/[^a-zA-Z0-9_\/.-]/g, '_');
            const t = (to || '').replace(/[^a-zA-Z0-9_\/.-]/g, '_');
            if (!f || !t) return;
            lines.push(`  ${f} -- ${label} --> ${t}`);
        };
        for (const r of Object.values(rels)) addEdge(r.from, r.to, r.type || 'rel');
        for (const r of Object.values(observedRels)) addEdge(r.from, r.to, r.type || 'rel');
        await ensureDir(DIAGRAMS_DIR);
        await fs.writeFile(path.join(DIAGRAMS_DIR, 'graph.mmd'), lines.join('\n'));
        console.log(`Generated ${path.join('memory-bank', 'diagrams', 'graph.mmd')}`);
    } catch (e) {
        console.warn('Failed to generate relations diagram:', e.message);
    }
}

function injectOrReplaceSection(content, header, body) {
    const sectionHeader = `## ${header}`;
    const start = content.indexOf(sectionHeader);
    if (start !== -1) {
        const end = content.indexOf('\n## ', start + sectionHeader.length);
        if (end !== -1) return content.substring(0, start) + body + content.substring(end);
        return content.substring(0, start) + body;
    }
    return content + body;
}

async function updateReadmeDriftSection(compiledPath) {
    try {
        const compiled = JSON.parse(await fs.readFile(compiledPath, 'utf-8'));
        const drift = compiled.drift || { observedNotDeclared: [], declaredNotObserved: [] };
        let readme = '';
        try { readme = await fs.readFile(README_PATH, 'utf-8'); } catch {}
        const section = [];
        section.push('\n## Drift');
        section.push('');
        section.push(`- observedNotDeclared: ${drift.observedNotDeclared.length}`);
        section.push(`- declaredNotObserved: ${drift.declaredNotObserved.length}`);
        section.push('');
        const body = section.join('\n') + '\n';
        const updated = injectOrReplaceSection(readme, 'Drift', body);
        await fs.writeFile(README_PATH, updated);
    } catch (e) {
        console.warn('Failed to update README drift section:', e.message);
    }
}

async function getChangedFiles() {
    try {
        const out = await run('git diff --name-only HEAD');
        return out.split('\n').filter(Boolean);
    } catch {
        return [];
    }
}

async function performAudit(graph, fileList = null) {
    console.log('\n--- Performing Project Graph Audit ---');
    // Apply exclude patterns from settings if present
    let excludePatterns = [];
    try {
        const settingsContent = await fs.readFile(SETTINGS_PATH, 'utf-8');
        const settings = JSON.parse(settingsContent);
        const configured = settings.options && settings.options.audit_exclude_patterns && settings.options.audit_exclude_patterns.value;
        if (Array.isArray(configured)) excludePatterns = configured;
        const changedOnly = settings.options && settings.options.audit_changed_only && settings.options.audit_changed_only.value;
        if (!fileList && changedOnly) fileList = await getChangedFiles();
    } catch {}
    // Normalize graph entity paths to use forward slashes

    const normalizedGraphEntities = new Set(
        Object.keys(graph.entities).map(entityPath => entityPath.replace(/\\/g, '/'))
    );

    let filesToAudit = [];
    if (fileList) {
        filesToAudit = fileList.map(file => file.replace(/\\/g, '/')); // Normalize input fileList
    } else {
        for (const dir of AUDIT_DIRECTORIES) {
            const files = await getAllFiles(dir); // getAllFiles now returns relative paths with native separators
            filesToAudit.push(...files.map(file => file.replace(/\\/g, '/'))); // Normalize to forward slashes
        }
    }
    if (excludePatterns.length) {
        filesToAudit = filesToAudit.filter(f => !excludePatterns.some(p => minimatch(f, p)));
    }

    const missingFromGraph = [];
    filesToAudit.forEach(file => {
        if (!normalizedGraphEntities.has(file)) {
            missingFromGraph.push(file);
        }
    });

    const missingFromProject = [];
    normalizedGraphEntities.forEach(entityPath => {
        // Only check entities that look like file paths and are in the audit directories
        if (entityPath.includes('/') && AUDIT_DIRECTORIES.some(dir => entityPath.startsWith(dir))) { 
            if (!filesToAudit.includes(entityPath)) {
                missingFromProject.push(entityPath);
            }
        }
    });

    if (missingFromGraph.length === 0 && missingFromProject.length === 0) {
        console.log('[OK] Graph is in sync with the the audited files.');
    } else {
        if (missingFromGraph.length > 0) {
            console.log('\n[WARNING] Files exist in project but are MISSING from the graph:');
            missingFromGraph.forEach(file => console.log(`  - ${file}`));
        }
        if (missingFromProject.length > 0) {
            console.log('\n[WARNING] Entities in graph but file does NOT EXIST in the audited scope:');
            missingFromProject.forEach(file => console.log(`  - ${file}`));
        }
        console.log('\nPlease update project_graph/graph_parts/entities.jsonnet to resolve these discrepancies.');
    }
    console.log('----------------------------------');

    // Read settings to decide on memory-bank update
    try {
        const settingsContent = await fs.readFile(SETTINGS_PATH, 'utf-8');
        const settings = JSON.parse(settingsContent);

        if (settings.options.update_memory_bank_on_audit.value) {
            const logEntry = `Audit performed on ${new Date().toISOString()}. Scope: ${fileList ? 'Committed Files' : 'Full Project'}. Status: ${missingFromGraph.length === 0 && missingFromProject.length === 0 ? 'OK' : 'WARNINGS'}.\n`;
            await fs.appendFile(path.join(MEMORY_BANK_DIR, 'audit_logs.md'), logEntry);
            console.log('Audit results logged to memory-bank/audit_logs.md');
        }
    } catch (settingsError) {
        console.warn(`Could not read settings.json or update memory-bank: ${settingsError.message}`);
    }
}

async function runGenerator() {
    console.log('Starting Project Graph Generator...');

    // 1. Compile Jsonnet to JSON
    console.log(`Compiling ${GRAPH_SOURCE}...`);
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await run(`jsonnet -J ${PROJECT_GRAPH_DIR} --ext-str timestamp='${new Date().toISOString()}' -o ${COMPILED_GRAPH} ${GRAPH_SOURCE}`);
    const graph = JSON.parse(await fs.readFile(COMPILED_GRAPH, 'utf-8'));

    // 2. Generate settings.json if it doesn't exist
    await generateSettingsFile(graph);

    // 3. Generate README.md
    await generateReadme(graph);

    // 4. Run adapters to get observed graph and attach to compiled JSON on disk
    const observed = await runAdapters(graph);
    try {
        const compiled = JSON.parse(await fs.readFile(COMPILED_GRAPH, 'utf-8'));
        compiled.observed = observed;
        await fs.writeFile(COMPILED_GRAPH, JSON.stringify(compiled, null, 2));
    } catch (e) {
        console.warn('Could not attach observed graph to compiled output:', e.message);
    }

    // 5. Perform Full Audit
    await performAudit(graph);

    // 6. Drift, snapshot, event, diagrams
    const drift = await writeDriftArtifacts(COMPILED_GRAPH);
    await snapshotGraph();
    await appendEvent({ event: 'graph_generated', observedCounts: { entities: Object.keys(observed.entities).length, relations: Object.keys(observed.relations).length }, drift });
    await writeRelationsDiagram(COMPILED_GRAPH);
    await updateReadmeDriftSection(COMPILED_GRAPH);

    // 7. Write plans markdown
    await writePlansMarkdown(graph);

    // 8. Cleanup or keep compiled graph based on settings or CLI flag
    let keepCompiled = false;
    try {
        const settingsContent = await fs.readFile(SETTINGS_PATH, 'utf-8');
        const settings = JSON.parse(settingsContent);
        keepCompiled = !!(settings.options && settings.options.keep_compiled_graph && settings.options.keep_compiled_graph.value);
    } catch {}
    const keepViaCli = process.argv.includes('--keep-compiled');
    if (keepCompiled || keepViaCli) {
        console.log(`Compiled graph kept at ${COMPILED_GRAPH}`);
    } else {
        await fs.unlink(COMPILED_GRAPH).catch(() => {});
        console.log('Temporary compiled graph removed.');
    }
    console.log('\nProject Graph Generator finished successfully.');
}

runGenerator().catch(error => {
    console.error('\nProject Graph Generator failed:', error);
    fs.unlink(COMPILED_GRAPH).catch(() => {}); 
});