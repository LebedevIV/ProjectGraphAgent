// adapters/typescript.mjs
// Lightweight extractor for observed entities/relations using regex scanning (no external deps).

import fs from 'fs/promises'
import path from 'path'

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx'])

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dirPath, e.name)
    if (e.isDirectory()) await getAllFiles(full, arrayOfFiles)
    else arrayOfFiles.push(full)
  }
  return arrayOfFiles
}

function toRelPosix(root, full) {
  return path.relative(root, full).split(path.sep).join('/')
}

async function readText(file) {
  try { return await fs.readFile(file, 'utf-8') } catch { return '' }
}

function detectType(relPath, content) {
  if (relPath.startsWith('electron/')) return 'ElectronSource'
  if (relPath.endsWith('.tsx')) return 'ReactSource'
  return 'SourceFile'
}

function extractImports(content) {
  const imports = []
  const importRe = /import\s+[^'";]+from\s+['\"]([^'\"]+)['\"]/g
  const importSideRe = /import\s+['\"]([^'\"]+)['\"]/g
  const requireRe = /require\(\s*['\"]([^'\"]+)['\"]\s*\)/g
  let m
  while ((m = importRe.exec(content))) imports.push(m[1])
  while ((m = importSideRe.exec(content))) imports.push(m[1])
  while ((m = requireRe.exec(content))) imports.push(m[1])
  return imports
}

export async function extract({ projectRoot }) {
  const roots = ['src', 'electron']
  const entities = {}
  const relations = {}
  for (const r of roots) {
    const abs = path.join(projectRoot, r)
    try {
      const files = await getAllFiles(abs)
      for (const f of files) {
        const ext = path.extname(f)
        if (!SOURCE_EXT.has(ext)) continue
        const rel = toRelPosix(projectRoot, f)
        const content = await readText(f)
        entities[rel] = { type: detectType(rel, content), path: rel }
        const imps = extractImports(content)
        for (const spec of imps) {
          // Only map relative imports to file relations; skip package imports
          if (spec.startsWith('./') || spec.startsWith('../')) {
            relations[`${rel}::imports::${spec}`] = {
              from: rel,
              to: spec, // keep module spec; resolver can post-process
              type: 'imports',
            }
          }
        }
      }
    } catch {}
  }
  return { entities, relations }
}


