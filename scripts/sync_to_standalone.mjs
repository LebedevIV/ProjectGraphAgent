#!/usr/bin/env node

/**
 * ProjectGraphAgent Sync to Standalone
 * 
 * This script syncs changes from the parent project's ProjectGraphAgent
 * to the standalone ProjectGraphAgent directory for publication.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Paths
const PARENT_PROJECT = '/home/igor/Документы/Проекты/tsx_viewer/ProjectGraphAgent';
const STANDALONE_PROJECT = '/home/igor/Документы/Проекты/ProjectGraphAgent';

// Files to sync (relative to ProjectGraphAgent root)
const FILES_TO_SYNC = [
    'scripts/',
    'graph_parts/',
    'adapters/',
    'README.md',
    'README_PUBLISH.md',
    'CHANGELOG.md',
    'LLM_GUIDELINES.md',
    'LICENSE',
    'package.json',
    '.gitignore'
];

// Files to exclude from sync (parent project specific)
const FILES_TO_EXCLUDE = [
    'project_graph.jsonnet',  // Contains parent project data
    'graph_parts/entities.jsonnet',  // Contains parent project entities
    'settings.json',  // Parent project settings
    '.cache/',  // Generated artifacts
    'memory-bank/'  // Parent project memory
];

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function copyFile(sourcePath, destPath) {
    try {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        if (fs.statSync(sourcePath).isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
        return true;
    } catch (error) {
        log(`Failed to copy ${sourcePath}: ${error.message}`, 'error');
        return false;
    }
}

function shouldExclude(filePath) {
    return FILES_TO_EXCLUDE.some(excludePattern => {
        if (excludePattern.endsWith('/')) {
            return filePath.startsWith(excludePattern);
        }
        return filePath === excludePattern;
    });
}

function syncDirectory(sourceDir, destDir, relativePath = '') {
    let successCount = 0;
    let totalCount = 0;
    
    try {
        const items = fs.readdirSync(sourceDir);
        
        for (const item of items) {
            const sourcePath = path.join(sourceDir, item);
            const destPath = path.join(destDir, item);
            const relativeItemPath = path.join(relativePath, item);
            
            if (shouldExclude(relativeItemPath)) {
                log(`Skipping excluded file: ${relativeItemPath}`, 'info');
                continue;
            }
            
            totalCount++;
            
            if (fs.statSync(sourcePath).isDirectory()) {
                if (copyFile(sourcePath, destPath)) {
                    successCount += syncDirectory(sourcePath, destPath, relativeItemPath);
                    totalCount += 1; // Directory itself counts as one item
                }
            } else {
                if (copyFile(sourcePath, destPath)) {
                    successCount++;
                }
            }
        }
    } catch (error) {
        log(`Failed to sync directory ${sourceDir}: ${error.message}`, 'error');
    }
    
    return successCount;
}

function syncSpecificFiles() {
    let successCount = 0;
    let totalCount = 0;
    
    for (const filePattern of FILES_TO_SYNC) {
        const sourcePath = path.join(PARENT_PROJECT, filePattern);
        const destPath = path.join(STANDALONE_PROJECT, filePattern);
        
        if (fs.existsSync(sourcePath)) {
            totalCount++;
            if (fs.statSync(sourcePath).isDirectory()) {
                const count = syncDirectory(sourcePath, destPath, filePattern);
                successCount += count;
            } else {
                if (copyFile(sourcePath, destPath)) {
                    successCount++;
                }
            }
        } else {
            log(`Source file/directory not found: ${sourcePath}`, 'error');
        }
    }
    
    return { successCount, totalCount };
}

function main() {
    log('Starting ProjectGraphAgent sync to standalone...');
    log(`Source: ${PARENT_PROJECT}`);
    log(`Destination: ${STANDALONE_PROJECT}`);
    
    // Check if source exists
    if (!fs.existsSync(PARENT_PROJECT)) {
        log(`Source directory not found: ${PARENT_PROJECT}`, 'error');
        process.exit(1);
    }
    
    // Check if destination exists
    if (!fs.existsSync(STANDALONE_PROJECT)) {
        log(`Creating destination directory: ${STANDALONE_PROJECT}`, 'info');
        fs.mkdirSync(STANDALONE_PROJECT, { recursive: true });
    }
    
    const { successCount, totalCount } = syncSpecificFiles();
    
    log(`Sync completed: ${successCount}/${totalCount} operations successful`);
    
    if (successCount > 0) {
        log('Files synced successfully!', 'success');
        log('Next steps:');
        log('1. Review the synced files in standalone directory');
        log('2. Run cleanup script: cd /home/igor/Документы/Проекты/ProjectGraphAgent && npm run clean');
        log('3. Commit and push to GitHub');
    } else {
        log('No files were synced. Please check the source directory.', 'error');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
