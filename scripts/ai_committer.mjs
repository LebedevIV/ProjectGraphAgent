// scripts/ai_committer.mjs
// Group staged files by commitGroups and create atomic commits per group.

import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

const PROJECT_ROOT = process.cwd()
const PROJECT_GRAPH_DIR = path.join(PROJECT_ROOT, 'project_graph')
const GRAPH_SOURCE = path.join(PROJECT_GRAPH_DIR, 'project_graph.jsonnet')

const run = (cmd, options = {}) => new Promise((resolve, reject) => {
  exec(cmd, options, (error, stdout, stderr) => {
    if (error) return reject(new Error(stderr || stdout || error.message))
    resolve(stdout.trim())
  })
})

async function compileGraph() {
  const compiled = await run(`jsonnet -J ${PROJECT_GRAPH_DIR} ${GRAPH_SOURCE}`)
  return JSON.parse(compiled)
}

async function getStagedFiles() {
  const out = await run('git diff --cached --name-only')
  return out.split('\n').filter(Boolean)
}

function matchGroup(file, group) {
  const mm = require('minimatch')
  return (group.patterns || []).some(p => mm(file, p))
}

async function commitGroup(files, group) {
  if (!files.length) return
  const message = `${group.messagePrefix} grouped changes`
  await run('git reset')
  // Stage only these files
  const chunks = []
  for (const f of files) chunks.push(run(`git add -- "${f}"`))
  await Promise.all(chunks)
  await run(`git commit -m "${message}"`)
}

async function main() {
  const graph = await compileGraph()
  const groups = graph.commitGroups || {}
  const staged = await getStagedFiles()
  if (!staged.length) {
    console.log('No staged files to commit.')
    return
  }

  // Separate parent project files vs graph/rules
  const projectFiles = staged.filter(f => !f.startsWith('project_graph/') && !f.startsWith('.cursor/') && !f.startsWith('.gemini/') && !f.startsWith('.roo/') && !f.startsWith('.kilocode/'))
  const graphFiles = staged.filter(f => f.startsWith('project_graph/'))
  const rulesFiles = staged.filter(f => f.startsWith('.cursor/') || f.startsWith('.gemini/') || f.startsWith('.roo/') || f.startsWith('.kilocode/'))

  // Build buckets for parent project by commitGroups
  const buckets = {}
  for (const [id, group] of Object.entries(groups)) buckets[id] = []
  const unmatched = []

  for (const file of projectFiles) {
    let matched = false
    for (const [id, group] of Object.entries(groups)) {
      if (matchGroup(file, group)) {
        buckets[id].push(file)
        matched = true
        break
      }
    }
    if (!matched) unmatched.push(file)
  }

  // Commit in a stable order
  for (const [id, group] of Object.entries(groups)) {
    await commitGroup(buckets[id], group)
  }
  if (unmatched.length) await commitGroup(unmatched, { messagePrefix: 'chore:' })

  // Commit graph and rules separately if staged
  if (graphFiles.length) await commitGroup(graphFiles, { messagePrefix: 'chore(graph):' })
  if (rulesFiles.length) await commitGroup(rulesFiles, { messagePrefix: 'chore(rules):' })
}

main().catch(err => {
  console.error('ai_committer failed:', err.message)
  process.exit(1)
})

// TODO: Implement the AI Committer script as described in README.md
// This script should automate the creation of atomic commits based on the commitGroups defined in project_graph.jsonnet.
