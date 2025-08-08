# ProjectGraphAgent

ProjectGraphAgent — это система управления проектами на основе Jsonnet, разработанная для AI-агентов (таких как Cursor, Gemini, Claude, Roo, Kilocode). Она предоставляет комплексную среду для документирования архитектуры проекта, отслеживания расхождений между заявленным и наблюдаемым состояниями, генерации визуальных диаграмм, автоматизации сгруппированных коммитов и создания артефактов, понятных для агентов.

## Ключевые особенности

- **Заявленный и наблюдаемый граф**: Модель "заявленного" состояния в Jsonnet + модель "наблюдаемого" состояния от языковых адаптеров → автоматическое обнаружение расхождений.
- **Выходные данные для агентов**: Скомпилированный граф в JSON, отчеты о расхождениях, диаграммы Mermaid, markdown-файлы с планами, снимки состояния и события.
- **Автоматизация**: Группировка коммитов, синхронизация AI-команд, интеграция с CI-воркфлоу.
- **Поддержка нескольких языков**: Адаптеры для TypeScript/JavaScript и Python (с возможностью расширения).

## Структура

*   `project_graph.jsonnet`
    *   Корневой файл, который собирает весь граф, включая метаданные проекта, сущности, отношения, политики и правила группировки коммитов.
*   `graph_parts/`
    *   `entities.jsonnet`: Определяет все основные компоненты, файлы и ресурсы проекта.
    *   `relations.jsonnet`: Определяет отношения *между* сущностями (например, какой компонент что использует, каналы IPC).
    *   `templates.jsonnet`: Переиспользуемые схемы для различных типов сущностей.
    *   `policies.jsonnet`: Определяет архитектурные правила и соглашения для проекта.
    *   `meta.jsonnet`: Содержит метаданные о самом графе проекта.
    *   `ai_commands.jsonnet`: Определяет сопоставления для команд AI-ассистентов.
*   `scripts/`
    *   `ai_committer.mjs`: Скрипт, который автоматизирует создание категоризированных Git-коммитов на основе `commitGroups`, определенных в `project_graph.jsonnet`.
    *   `clean_project.mjs`: Скрипт, связанный с графом проекта.
    *   `graph_generator.mjs`: Скрипт, который генерирует этот README, сравнивает граф с реальными файлами проекта и сообщает о любых расхождениях.
    *   `graph_validator.mjs`: (В будущем) Скрипт для проверки графа на соответствие политикам, определенным в `policies.jsonnet`.
    *   `publish_workflow.mjs`: Скрипт, связанный с графом проекта.
    *   `sync_ai_commands.mjs`: Скрипт, который синхронизирует определения AI-команд между различными файлами правил AI-ассистентов.
    *   `sync_to_standalone.mjs`: Скрипт, связанный с графом проекта.

## Использование

### Быстрый старт

1.  **Скопируйте систему** в ваш проект:
    ```bash
    cp -r ProjectGraphAgent/ ваш-проект/
    ```

2.  **Настройте конфигурацию** в `ProjectGraphAgent/project_graph.jsonnet`:
    ```jsonnet
    {
        projectName: 'название-вашего-проекта',
        projectUrl: 'https://github.com/ваш-логин/ваш-проект',
        description: 'Описание вашего проекта.',
        // ... остальная конфигурация
    }
    ```

3.  **Установите зависимости**:
    ```bash
    # Установка Jsonnet
    # Linux: apt install jsonnet
    # macOS: brew install jsonnet
    # Windows: winget install jsonnet
    ```

4.  **Запустите генератор**:
    ```bash
    node ProjectGraphAgent/scripts/graph_generator.mjs --keep-compiled
    ```

### Сгенерированные артефакты

- `ProjectGraphAgent/.cache/graph.json` - Скомпилированный граф с наблюдаемыми данными и расхождениями.
- `memory-bank/diagrams/graph.mmd` - Диаграмма Mermaid для отношений.
- `memory-bank/drift.md` - Отчет о расхождениях (заявленное vs. наблюдаемое).
- `memory-bank/plans/` - Markdown-файлы с планами для конкретных доменов.

### Интеграция с CI

Добавьте в `.github/workflows/*.yml`:
```yaml
- name: Generate Graph
  run: node ProjectGraphAgent/scripts/graph_generator.mjs --keep-compiled
- name: Validate Graph
  run: node ProjectGraphAgent/scripts/graph_validator.mjs
```

## Сопоставление команд AI-ассистентов

Чтобы упростить взаимодействие с AI-ассистентами, вы можете настроить их на запуск `npm run graph:audit` и `npm run graph:commit` с помощью более простых, разговорных команд. Ниже приведены примеры того, как это сделать для различных AI-ассистентов на основе определений в `graph_parts/ai_commands.jsonnet`.

**Важно:** Точный синтаксис и возможности могут различаться у разных AI-ассистентов. Для получения точных сведений о конфигурации обратитесь к документации вашего AI.

### Для Cursor (`.cursor/rules/general-rules.mdc`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Выполняет скрипт аудита графа проекта для проверки расхождений между определением графа и реальными файлами проекта.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Выполняет скрипт AI Committer для автоматической категоризации и коммита подготовленных изменений на основе правил из project_graph.jsonnet.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Синхронизирует определения AI-команд между различными файлами правил AI-ассистентов.
```

### Для Gemini Code Assistant (`.gemini/GEMINI.md`)

```markdown
- **Command Aliases:** Когда пользователь запрашивает "graph-audit", "audit graph", "check graph" или "run audit", выполнить `node project_graph/scripts/graph_generator.mjs`.
- **Command Aliases:** Когда пользователь запрашивает "graph-commit", "commit graph", "auto commit" или "run committer", выполнить `npm run graph:commit`.
- **Command Aliases:** Когда пользователь запрашивает "sync-ai-commands", "sync ai", "update ai rules" или "sync assistant commands", выполнить `npm run sync:ai-commands`.
```

### Для Kilocode (`.kilocode/rules/general-rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Выполняет скрипт аудита графа проекта для проверки расхождений между определением графа и реальными файлами проекта.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Выполняет скрипт AI Committer для автоматической категоризации и коммита подготовленных изменений на основе правил из project_graph.jsonnet.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Синхронизирует определения AI-команд между различными файлами правил AI-ассистентов.
```

### Для Roo (`.roo/rules/rules.md`)

```markdown
## Graph Audit
- **Trigger Phrase:** "graph-audit"
- **Action:** Run `node project_graph/scripts/graph_generator.mjs`
- **Description:** Выполняет скрипт аудита графа проекта для проверки расхождений между определением графа и реальными файлами проекта.

## Graph Commit
- **Trigger Phrase:** "graph-commit"
- **Action:** Run `npm run graph:commit`
- **Description:** Выполняет скрипт AI Committer для автоматической категоризации и коммита подготовленных изменений на основе правил из project_graph.jsonnet.

## Sync Ai Commands
- **Trigger Phrase:** "sync-ai-commands"
- **Action:** Run `npm run sync:ai-commands`
- **Description:** Синхронизирует определения AI-команд между различными файлами правил AI-ассистентов.
```

## Расхождения (Drift)

- observedNotDeclared: 0
- declaredNotObserved: 13

## Рабочий процесс разработки

### Настройка с двумя директориями

ProjectGraphAgent разработан для работы в двух режимах:

1.  **Режим родительского проекта** (`/home/igor/Документы/Проекты/tsx_viewer/ProjectGraphAgent/`)
    -   Содержит данные, специфичные для проекта (сущности и настройки TSX-viewer).
    -   Используется для активной разработки и тестирования.
    -   Управляет родительским проектом (TSX-viewer).

2.  **Автономный режим** (`/home/igor/Документы/Проекты/ProjectGraphAgent/`)
    -   Чистый, универсальный шаблон.
    -   Готов к публикации на GitHub.
    -   Используется для распространения и переиспользования.

### Процесс синхронизации

1.  **Разработка в родительском проекте**:
    ```bash
    # Работайте в tsx_viewer/ProjectGraphAgent/
    # Вносите изменения в скрипты, graph_parts, адаптеры и т.д.
    ```

2.  **Синхронизация с автономной версией**:
    ```bash
    # Из директории tsx_viewer/ProjectGraphAgent/
    npm run sync
    ```

3.  **Очистка автономной версии для публикации**:
    ```bash
    cd /home/igor/Документы/Проекты/ProjectGraphAgent
    npm run clean
    ```

4.  **Публикация на GitHub**:
    ```bash
    cd /home/igor/Документы/Проекты/ProjectGraphAgent
    git add -A
    git commit -m "feat: новое описание фичи"
    git push origin main
    ```

### Автоматизированный процесс публикации

Для удобства используйте автоматизированный воркфлоу публикации:

```bash
# Из директории tsx_viewer/ProjectGraphAgent/
npm run publish
```

Этот скрипт:
1.  Синхронизирует изменения в автономную директорию.
2.  Очистит автономную версию от данных родительского проекта.
3.  Подготовит Git-коммит.
4.  Покажет инструкции для push.

Для автоматической отправки на GitHub:
```bash
npm run publish -- --push
```

### Что синхронизируется

**Синхронизируемые файлы** (из родительского проекта в автономный):
- `scripts/` - Все скрипты автоматизации.
- `graph_parts/` - Шаблоны, политики, схемы (кроме `entities`).
- `adapters/` - Языковые адаптеры.
- `README.md`, `README_PUBLISH.md`, `CHANGELOG.md`, `LLM_GUIDELINES.md`
- `LICENSE`, `package.json`, `.gitignore`

**Исключенные файлы** (специфичные для родительского проекта):
- `project_graph.jsonnet` - Содержит данные родительского проекта.
- `graph_parts/entities.jsonnet` - Содержит сущности родительского проекта.
- `settings.json` - Настройки родительского проекта.
- `.cache/`, `memory-bank/` - Сгенерированные артефакты.

## Очистка от данных родительского проекта

Когда вы копируете ProjectGraphAgent из родительского проекта, вы можете очистить его от специфичных данных:

```bash
# Очистка от данных родительского проекта
npm run clean

# Или напрямую
node scripts/clean_project.mjs
```

Это приведет к:
- Сбросу `project_graph.jsonnet` к шаблонным значениям.
- Очистке `graph_parts/entities.jsonnet` до универсальных примеров.
- Удалению `.cache/`, `memory-bank/`, `settings.json`.
- Обновлению `package.json` метаданными ProjectGraphAgent.
- Созданию соответствующего `.gitignore`.

### Процесс публикации автономной версии

1.  **Скопируйте в отдельную директорию**:
    ```bash
    mkdir -p /home/igor/Документы/Проекты/ProjectGraphAgent
    cp -r ProjectGraphAgent/* /home/igor/Документы/Проекты/ProjectGraphAgent/
    ```

2.  **Запустите очистку**:
    ```bash
    cd /home/igor/Документы/Проекты/ProjectGraphAgent
    npm run clean
    ```

3.  **Опубликуйте на GitHub**:
    ```bash
    git init
    git remote add origin https://github.com/LebedevIV/ProjectGraphAgent.git
    git add -A
    git commit -m "Initial commit: ProjectGraphAgent v0.1.0-alpha"
    git push -u origin main
    ```

Смотрите `CLEANUP_INSTRUCTIONS.md` для подробных инструкций.

## Статус Alpha

⚠️ **Ранняя Alpha**: Эта система находится в активной разработке.

**Текущие ограничения:**
- Адаптеры используют базовые эвристики (простое сканирование импортов).
- Обнаружение расхождений работает только на уровне сущностей.
- Движок политик является базовым (проверка формы/схемы).
- Продвинутый DSL для правил появится в будущих версиях.

## Лицензия

Наследует лицензию репозитория (по умолчанию GPL-3.0-or-later).

## Участие в разработке

Смотрите `CONTRIBUTING.md` для получения информации о процессе разработки и внесении вклада.
