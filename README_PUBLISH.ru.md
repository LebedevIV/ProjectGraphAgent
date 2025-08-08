# ProjectGraphAgent (ранняя альфа-версия)

ProjectGraphAgent — это система управления проектами на основе Jsonnet для AI-агентов (Cursor, Gemini, Claude, Roo, Kilocode). Она документирует архитектуру, отслеживает расхождения, генерирует диаграммы, группирует коммиты и создает артефакты, понятные для агентов.

- **Заявленное vs. Наблюдаемое**: Модель "заявленного" состояния в Jsonnet + модель "наблюдаемого" от адаптеров → расхождения.
- **Выходные данные для агентов**: скомпилированный JSON графа, отчет о расхождениях, диаграммы Mermaid, markdown-файлы с планами, снимки состояния и события.
- **Автоматизация**: группировка коммитов, синхронизация AI-команд, CI-воркфлоу.

## Требования
- Node.js 18+
- Jsonnet CLI (`jsonnet` в PATH)

## Быстрый старт (встраивание в любой проект)
1) Скопируйте папку `ProjectGraphAgent/` в корень вашего репозитория.
2) Убедитесь, что Jsonnet установлен (Linux: `apt install jsonnet`, macOS: `brew install jsonnet`).
3) Настройте `ProjectGraphAgent/project_graph.jsonnet` под ваш проект:
   ```jsonnet
   {
       projectName: 'название-вашего-проекта',
       projectUrl: 'https://github.com/ваш-логин/ваш-проект',
       description: 'Описание вашего проекта.',
       // ... остальная конфигурация
   }
   ```
4) (Опционально) Добавьте npm-скрипты в ваш `package.json`:
   ```json
   {
     "scripts": {
       "graph:audit": "node ProjectGraphAgent/scripts/graph_generator.mjs",
       "graph:validate": "node ProjectGraphAgent/scripts/graph_validator.mjs",
       "graph:commit": "node ProjectGraphAgent/scripts/ai_committer.mjs",
       "sync:ai-commands": "node ProjectGraphAgent/scripts/sync_ai_commands.mjs"
     }
   }
   ```
5) Запустите генератор:
   ```bash
   node ProjectGraphAgent/scripts/graph_generator.mjs --keep-compiled
   ```
   Артефакты:
   - `ProjectGraphAgent/.cache/graph.json` (включая наблюдаемое состояние + расхождения)
   - `memory-bank/diagrams/graph.mmd`
   - `memory-bank/drift.md`
   - `memory-bank/plans/` (markdown для каждого домена + сводка)

## CI (GitHub Actions)
Добавьте эту задачу в `.github/workflows/*.yml`:
```yaml
- name: Generate Graph
  run: node ProjectGraphAgent/scripts/graph_generator.mjs --keep-compiled
- name: Validate Graph
  run: node ProjectGraphAgent/scripts/graph_validator.mjs
```

## Основные концепции
- **Граф Jsonnet**: `ProjectGraphAgent/project_graph.jsonnet` импортирует `graph_parts/*`.
- **Наблюдаемый граф**: адаптеры (`adapters/typescript.mjs`, `adapters/python.mjs`).
- **Расхождения**: вычисляются автоматически; сводка в README и memory-bank.
- **Планы**: определяются в Jsonnet, выводятся в markdown, отслеживаются агентами.

## Ограничения альфа-версии
- Адаптеры используют эвристики (базовое сканирование импортов).
- Расхождения определяются на уровне сущностей; серьезность расхождений для связей будет определена позже.
- Политики работают на уровне схемы/структуры; DSL для правил появится позже.

## Лицензия
Наследует лицензию репозитория (по умолчанию GPL-3.0-or-later).
