// scripts/sync_ai_commands.mjs
// Synchronize AI commands into agent-specific rule files if present.

import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

const PROJECT_ROOT = process.cwd()
const PROJECT_GRAPH_DIR = PROJECT_ROOT
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

async function syncPlatform({ platformKey, platform, commands }) {
  const target = path.join(PROJECT_ROOT, platform.configPath)
  try {
    await fs.access(target)
  } catch {
    console.warn(`Skipping ${platform.name}: ${platform.configPath} not found`)
    return
  }
  const lines = []
  lines.push('')
  lines.push('<!-- Synced by project_graph/scripts/sync_ai_commands.mjs -->')
  lines.push(`<!-- ${new Date().toISOString()} -->`)
  lines.push('')
  for (const cmd of commands) {
    if (platformKey === 'gemini') {
      const aliases = cmd.triggerPhrases.map(p => `"${p}"`).join(' or ')
      lines.push(`- Command Aliases: When the user requests ${aliases}, execute \`${cmd.npmCommand}\`${cmd.implemented === false ? ' (planned)' : ''}.`)
    } else {
      const header = cmd.name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')
      lines.push(`## ${header}`)
      lines.push(`- Trigger Phrase: "${cmd.triggerPhrases[0]}"`)
      lines.push(`- Action: Run \`${cmd.npmCommand}\`${cmd.implemented === false ? ' (planned)' : ''}`)
      lines.push(`- Description: ${cmd.description}`)
      lines.push('')
    }
  }
  await fs.appendFile(target, lines.join('\n'))
  console.log(`Synced commands to ${platform.configPath}`)
}

async function main() {
  const graph = await compileGraph()
  const cmds = (graph.aiCommands && graph.aiCommands.commands) || []
  const platforms = (graph.aiCommands && graph.aiCommands.platforms) || {}
  for (const [key, value] of Object.entries(platforms)) {
    await syncPlatform({ platformKey: key, platform: value, commands: cmds })
  }
}

main().catch(err => {
  console.error('sync_ai_commands failed:', err.message)
  process.exit(1)
})

// TODO: Implement the Sync AI Commands script as described in README.md
// This script should synchronize AI command definitions across various AI assistant rule files.
