// adapters/python.mjs
// Simple extractor for observed Python imports via regex (no external deps).

import fs from 'fs/promises'
import path from 'path'

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dirPath, e.name)
    if (e.isDirectory()) await getAllFiles(full, arrayOfFiles)
    else arrayOfFiles.push(full)
  }
  return arrayOfFiles
}

function toRelPosix(root, full) { return path.relative(root, full).split(path.sep).join('/') }

async function readText(file) { try { return await fs.readFile(file, 'utf-8') } catch { return '' } }

function extractImports(content) {
  const imports = []
  const re1 = /^\s*import\s+([\w\.]+)/gm
  const re2 = /^\s*from\s+([\w\.]+)\s+import\s+/gm
  let m
  while ((m = re1.exec(content))) imports.push(m[1])
  while ((m = re2.exec(content))) imports.push(m[1])
  return imports
}

export async function extract({ projectRoot }) {
  const entities = {}
  const relations = {}
  let files = []
  try { files = await getAllFiles(projectRoot) } catch {}
  for (const f of files) {
    if (!f.endsWith('.py')) continue
    const rel = toRelPosix(projectRoot, f)
    const content = await readText(f)
    entities[rel] = { type: 'PythonSource', path: rel }
    const imps = extractImports(content)
    for (const mod of imps) {
      relations[`${rel}::imports::${mod}`] = { from: rel, to: mod, type: 'imports' }
    }
  }
  return { entities, relations }
}


