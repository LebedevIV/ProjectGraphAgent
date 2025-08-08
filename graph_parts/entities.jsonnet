// graph_parts/entities.jsonnet
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
    'src/App.tsx': Component(
        name='App.tsx',
        path='src/App.tsx',
        purpose='The main application component, defines the overall layout and routes.',
        metadata=DefaultMetadata()
    ),
    'src/i18n.ts': FileEntity(
        kind='I18nConfiguration',
        path='src/i18n.ts',
        purpose='Internationalization setup using i18next.',
        metadata=DefaultMetadata()
    ),
    'src/icons/tsx_viewer.ico': FileEntity(
        kind='Asset',
        path='src/icons/tsx_viewer.ico',
        purpose='Application icon in ICO format.',
        metadata=DefaultMetadata()
    ),
    'src/icons/tsx_viewer.png': FileEntity(
        kind='Asset',
        path='src/icons/tsx_viewer.png',
        purpose='Application icon in PNG format.',
        metadata=DefaultMetadata()
    ),
    'src/index.css': FileEntity(
        kind='Styling',
        path='src/index.css',
        purpose='Global CSS styles for the application.',
        metadata=DefaultMetadata()
    ),
    'src/main.tsx': FileEntity(
        kind='EntryPoint',
        path='src/main.tsx',
        purpose='The main entry point for the React application.',
        metadata=DefaultMetadata()
    ),
    'src/tsx_viewer.desktop': FileEntity(
        kind='DesktopEntry',
        path='src/tsx_viewer.desktop',
        purpose='Desktop entry file for Linux systems.',
        metadata=DefaultMetadata()
    ),
    'src/window.d.ts': FileEntity(
        kind='TypeScriptDefinition',
        path='src/window.d.ts',
        purpose='TypeScript declaration file for window object.',
        metadata=DefaultMetadata()
    ),
    'electron/main.js': FileEntity(
        kind='ElectronMainProcess',
        path='electron/main.js',
        purpose='The main process for the Electron application.',
        metadata=DefaultMetadata()
    ),
    'electron/preload.js': FileEntity(
        kind='ElectronPreloadScript',
        path='electron/preload.js',
        purpose='Preload script for the Electron application, used for secure IPC.',
        metadata=DefaultMetadata()
    ),
    'test/emoji.json': FileEntity(
        kind='TestData',
        path='test/emoji.json',
        purpose='Test data in JSON format.',
        metadata=DefaultMetadata()
    ),
    'test/simple-test.tsx': FileEntity(
        kind='TestFile',
        path='test/simple-test.tsx',
        purpose='A simple test file for a React component.',
        metadata=DefaultMetadata()
    ),
    'test/test-component.tsx': FileEntity(
        kind='TestComponent',
        path='test/test-component.tsx',
        purpose='A React component used for testing purposes.',
        metadata=DefaultMetadata()
    ),
    'test/workout_program.tsx': FileEntity(
        kind='TestFile',
        path='test/workout_program.tsx',
        purpose='A test file for a workout program component.',
        metadata=DefaultMetadata()
    ),
    'test/workout_program_emoji.tsx': FileEntity(
        kind='TestFile',
        path='test/workout_program_emoji.tsx',
        purpose='A test file for a workout program component with emojis.',
        metadata=DefaultMetadata()
    ),
    'public/index.html': FileEntity(
        kind='HTML',
        path='public/index.html',
        purpose='The main HTML file for the application.',
        metadata=DefaultMetadata()
    ),
    'public/locales/en/translation.json': FileEntity(
        kind='Locale',
        path='public/locales/en/translation.json',
        purpose='English translation file.',
        metadata=DefaultMetadata()
    ),
    'public/locales/ru/translation.json': FileEntity(
        kind='Locale',
        path='public/locales/ru/translation.json',
        purpose='Russian translation file.',
        metadata=DefaultMetadata()
    ),
    // ... other entities
}