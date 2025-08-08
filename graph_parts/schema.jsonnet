// graph_parts/schema.jsonnet
// Formal schema for validating the compiled graph

{
  entityTypes: [
    'PackageManagementFile',
    'ReactComponent',
    'I18nConfiguration',
    'Asset',
    'Styling',
    'EntryPoint',
    'DesktopEntry',
    'TypeScriptDefinition',
    'ElectronMainProcess',
    'ElectronPreloadScript',
    'TestData',
    'TestFile',
    'TestComponent',
    'HTML',
    'Locale',
    'MetaGraphFile',
    'MetaDirectory',
    'UtilityScript',
    'MetaTemplateFile',
    'MetaConcept',
    'IPCChannel',
  ],

  relationTypes: [
    'uses', 'EXECUTES', 'READS', 'SCANS'
  ],

  requiredFieldsByType: {
    default: ['type', 'path'],
    MetaGraphFile: ['type'],
    MetaDirectory: ['type'],
    MetaTemplateFile: ['type'],
    MetaConcept: ['type'],
  },

  planStatus: ['planned', 'in_progress', 'implemented', 'deprecated'],
}


