# 📡 Документация API: Adsy AI Visibility

Базовый URL: `https://adsy-ai-visibility.vercel.app/api`

---

## 1. `POST /api/check/public`
Бесплатная экспресс-проверка для неавторизованных пользователей (гостевой режим по Слайдам 4, 6, 20).

### Request:
```json
{
  "url": "ahrefs.com",
  "guestSessionId": "optional-uuid"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "run": {
      "id": "run-uuid",
      "domain": "ahrefs.com",
      "brand_name": "Ahrefs",
      "mode": "public",
      "visibility_score": 60,
      "prompt_coverage": 60,
      "status": "completed",
      "created_at": "2026-09-27T12:00:00Z"
    },
    "prompts": [
      {
        "id": "p-1",
        "text": "What are the best SEO backlink analysis platforms in 2026?",
        "topic": "Backlink Intelligence",
        "prompt_type": "category",
        "has_brand_mention": true
      }
    ],
    "sampleAnswer": {
      "platform": "Perplexity",
      "raw_text": "Top backlink analysis platforms include Ahrefs, Semrush, and Moz...",
      "citations": ["https://techcrunch.com/..."],
      "brand_mentioned": true
    },
    "gaps": [
      {
        "id": "gap-1",
        "topic": "Organic Keyword Tracking",
        "rationale": "High search interest but lower observed citation share compared to primary competitors.",
        "prompts_list": ["Best rank tracking software 2026"]
      }
    ],
    "competitorsCount": 3,
    "sourcesCount": 6
  }
}
```
*Примечание:* Конкуренты в гостевом режиме скрыты на уровне схемы — отдается только их количество (`competitorsCount`), чтобы фронтенд мог отобразить заблокированное состояние под замком.

---

## 2. `POST /api/check/full`
Полный аудит для авторизованных клиентов Adsy (15 запросов, 45 наблюдений).

### Request:
```json
{
  "url": "monday.com",
  "customPrompts": [
    "Best enterprise team task trackers 2026"
  ],
  "customCompetitors": [
    { "name": "Asana", "domain": "asana.com" },
    { "name": "ClickUp", "domain": "clickup.com" }
  ]
}
```

### Response (200 OK):
Возвращает объект `FullCheckReport`:
* `run`: метаданные аудита.
* `prompts`: массив из 15 промптов (включая кастомные с флагом `is_custom: true`).
* `answers`: массив из 45 сырых ответов движков (ChatGPT, Perplexity, Claude).
* `sources`: цитируемые домены с ценами каталога Adsy (`is_in_adsy_catalog`, `adsy_price`).
* `competitors`: детальные метрики конкурентов (Visibility Score, Prompt Coverage, Mentions).
* `gaps`: выявленные пробелы видимости.

### Ошибки:
* `400 Bad Request`: Некорректный домен или синтаксис.
* `403 Forbidden`: Превышена месячная квота (`3/3 used`).
* `429 Too Many Requests`: Превышен лимит запросов в минуту.

---

## 3. `GET /api/inventory`
Каталог проверенных площадок Adsy с привязкой к найденным гэпам.

### Query Params:
* `gap` (string, optional): Фильтр по названию пробела видимости.
* `min_dr` (number, optional): Минимальный Domain Rating.
* `max_price` (number, optional): Максимальная цена размещения в USD.

### Response (200 OK):
Массив объектов `VerifiedPublisher` с метриками DR, DA, Traffic, Completion Rate, Price и статусом `aiVisibility` (`seenInAi: true`, `aiOpportunity: "High"`).

---

## 4. `GET /api/runs`
История всех выполненных аудитов.

### Query Params:
* `id` (string, optional): ID конкретного запуска для загрузки деталей.
* Без параметров: список последних запусков для вкладки **History**.

---

## 5. `POST /api/brief/save`
Сохранение сгенерированного ТЗ статьи перед переходом к оформлению в CP Adsy.

### Request:
```json
{
  "run_id": "run-uuid",
  "gap_id": "gap-uuid",
  "publisher_id": "13278",
  "publisher_domain": "techbullion.com",
  "target_domain": "monday.com",
  "brief_data": {
    "briefText": "PLACEMENT RECOMMENDATIONS & BRIEF FOR ADSY TASK...",
    "gapTopic": "Enterprise Collaboration"
  }
}
```
