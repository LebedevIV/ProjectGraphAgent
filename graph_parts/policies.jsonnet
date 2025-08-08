// graph_parts/policies.jsonnet
// This part defines project-wide development policies.

{
    graphUsage: {
      graphUsagePolicy: {
        rule: 'An AI assistant MUST read and parse this entire file, including all imported parts, at the beginning of a session. The assistant MUST consider the `metadata` block of each entity to assess the reliability of the information.',
        appliesTo: ['AIAssistant'],
      },
    },

    documentationSync: {
      rule: 'All changes to user-facing features or the build process must be documented in both the primary README.md and all localized versions (e.g., README.ru.md).',
      files: ['README.md', 'README.ru.md'],
    },
    releaseNotesUpdate: {
      rule: 'All significant changes, new features, and bug fixes must be added to RELEASE_NOTES.md under the correct version.',
      files: ['RELEASE_NOTES.md'],
    },
    memoryBankUpdate: {
        rule: 'The memory-bank must be updated to reflect the high-level context and \'why\' behind significant changes, following the structure defined in .cursor/rules/memory-bank.mdc.',
        files: ['memory-bank/'],
    },

    // Single source of truth for commit groups
    commitGroups: {
        feat: {
          id: 'feat',
          description: 'New feature or significant enhancement.',
          patterns: ['src/**/*.tsx', 'src/**/*.ts', 'electron/**/*.js'],
          messagePrefix: 'feat:',
        },
        fix: {
          id: 'fix',
          description: 'Bug fix.',
          patterns: ['src/**/*.tsx', 'src/**/*.ts', 'electron/**/*.js'],
          messagePrefix: 'fix:',
        },
        docs: {
          id: 'docs',
          description: 'Documentation only changes.',
          patterns: ['**/*.md', 'docs/**'],
          messagePrefix: 'docs:',
        },
        style: {
          id: 'style',
          description: 'Code style changes (formatting, whitespace, etc.).',
          patterns: ['src/**/*.css', 'tailwind.config.js', 'postcss.config.cjs'],
          messagePrefix: 'style:',
        },
        refactor: {
          id: 'refactor',
          description: 'A code change that neither fixes a bug nor adds a feature.',
          patterns: ['src/**/*.tsx', 'src/**/*.ts', 'electron/**/*.js'],
          messagePrefix: 'refactor:',
        },
        test: {
          id: 'test',
          description: 'Adding missing tests or correcting existing tests.',
          patterns: ['test/**'],
          messagePrefix: 'test:',
        },
        build: {
          id: 'build',
          description: 'Changes that affect the build system or external dependencies.',
          patterns: ['package.json', 'package-lock.json', 'vite.config.ts', 'electron-builder.json', 'snapcraft.yaml', 'flatpak.yml'],
          messagePrefix: 'build:',
        },
        ci: {
          id: 'ci',
          description: 'Changes to CI configuration files and scripts.',
          patterns: ['.github/**'],
          messagePrefix: 'ci:',
        },
        chore: {
          id: 'chore',
          description: "Other changes that don't modify src or test files.",
          patterns: ['.gitignore', '.vscode/**', '.cursorrules', '.gemini/**', '.kilocode/**', '.roo/**', 'project_graph/**', 'scripts/**', 'public/**'],
          messagePrefix: 'chore:',
        },
        revert: {
          id: 'revert',
          description: 'Reverts a previous commit.',
          patterns: [],
          messagePrefix: 'revert:',
        },
    },
}