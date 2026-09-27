# 📑 Engineering Continuity & System Handoff — Adsy AI Visibility

**Дата обновления:** 2026-09-27  
**Проект:** Adsy AI Visibility & GEO Audit Tool (`adsy-ai-visibility`)  
**Live URL:** [https://adsy-ai-visibility.vercel.app/](https://adsy-ai-visibility.vercel.app/)  
**GitHub Repos:**
- Приложение: `/Users/yevhen/ADSY/adsy-ai-visibility` (`origin/main`, commit `92680ff`)
- Агенты и Скиллы: `/Users/yevhen/ADSY/.agents` (`origin/main`, commit `46d09ca`)
- Бэкап стабильной версии до Concept-2: git tag `v1.0.0-stable`, branch `backup/pre-concept2`

---

## 1. System Map & Component Topology

```
[Пользователь / Клиент Adsy]
           │
           ▼
[Next.js 16 App Router UI / Tailwind CSS]
  ├── Hero & Audit Form (Brand, Domain, Language, Preset / Custom Prompts, Competitors)
  ├── KPI Metrics Banner (Visibility Score, Prompt Coverage X/15, Data Coverage 45/45, Strategic Gaps)
  ├── 4-Tab Results Section:
  │     ├── Tab 1: AI Engine Answers (Perplexity, ChatGPT, Gemini, Claude + Citations)
  │     ├── Tab 2: Cited Sources & Catalog Match (Exact Match in Adsy vs Thematic Alternative)
  │     ├── Tab 3: Competitor Comparison (Matrix & Gap Share)
  │     └── Tab 4: Strategic Recommendations & Action Plan
  └── Drawer: Custom Prompts (до 15) & Custom Competitors (до 5)
           │
           ▼
[Next.js API Routes (Serverless)]
  ├── POST /api/check/public (Rate limit 5/min, 2-layer L1/L2 cache, 3 prompts preview)
  ├── POST /api/check/full (Полный аудит 15 промптов x 4 модели, live grounding)
  ├── GET  /api/inventory (Каталог доноров Adsy с фильтрацией по DA, цене, нише)
  ├── GET  /api/runs (История запусков аудитов с пагинацией)
  └── POST /api/brief/save (Генерация структурированного ТЗ для кабинета Adsy)
           │
           ├──► [Tavily Web Search API] (Search Grounding & Live AI Responses)
           ├──► [Adsy CP Integration Helper] (Deep-linking URL generator: `getAdsyOrderUrl`)
           └──► [Supabase PostgreSQL (L2 Storage & Audit History)]
                  ├── check_runs
                  ├── check_prompts
                  ├── ai_answers
                  ├── check_sources
                  ├── check_competitors
                  └── check_gaps
```

---

## 2. Verified vs Unverified Status Matrix

| Компонент / Фича | Статус | Доказательство проверки | Заметки / Ограничения |
|---|---|---|---|
| **Form Inputs & Search Form** | ✅ Verified | Vitest: 85/85 green; Live UI manual test | Поддерживает ввод бренда, домена, выбор пресета. Нажатие Enter в Drawer не сабмитит форму. |
| **Custom Prompts & Competitors Drawer** | ✅ Verified | Vitest tests in `SearchForm.test.tsx` | Добавление до 15 кастомных промптов и до 5 конкурентов. |
| **API Endpoints (Public, Full, Inventory, Runs, Brief)** | ✅ Verified | 19 Vitest API route test suites; curl live check | Валидация через Zod, санитизация доменов, mock fallback при отсутствии Tavily ключа. |
| **Live Web Grounding (Tavily)** | ✅ Verified | API integration tests & mock suites | Fallback на детерминированные синтетические данные при оффлайне или лимите. |
| **L1 (In-Memory) + L2 (Supabase) Caching** | ✅ Verified | Vitest tests for cache manager | TTL 24 часа. Исключает повторные платные запросы к Tavily. |
| **Slide 10 KPI Formulas** | ✅ Verified | UI calculations verified in code | Prompt Coverage `X/15`, Data Coverage `45/45`, Visibility Score `%`. |
| **Catalog Match Badges** | ✅ Verified | UI Tab 2 verified | Разделение на `Exact AI Source in Adsy` vs `Thematic Alternative`. |
| **Adsy CP Deep Linking** | ✅ Verified | Unit tests for `getAdsyOrderUrl` | Формирует валидный URL с `platform`, `domain`, `brief`, `gap`, `source`. |
| **SSO Auth Handoff (Real Session)** | ⚠️ Unverified (Mocked) | Контракт описан в ТЗ и API Spec | На стороне лендинга готов контракт передачи токена; требуется бэкенд Adsy CP для валидации JWT/сессии. |
| **Live Catalog DB Auto-Sync (Cron)** | ⚠️ Semi-Verified | `scripts/export_adsy_catalog.py` готов | В продакшене используется локальный каталог `adsy-catalog.json`; требуется вебхук или pg_cron из MySQL Adsy. |

---

## 3. Runtime Diagnostics & Failure Recovery

### Алерты и сценарии сбоев:

1. **429 Too Many Requests (Rate Limiter)**
   - *Симптом:* Клиент получает `{"error": "Too many requests. Please wait before running another audit."}`.
   - *Диагностика:* Превышен лимит 5 аудитов в минуту на IP (`src/lib/rate-limiter.ts`).
   - *Действие:* Подождать 60 секунд. Для доверенных IP настроить белый список в переменной окружения.

2. **Отказ или таймаут внешнего Tavily API**
   - *Симптом:* Задержка ответа >10 сек или пустые результаты live-поиска.
   - *Диагностика:* Проверить статус Tavily API и остаток баланса кредитов.
   - *Восстановление:* Движок `ai-auditor.ts` автоматически переключается на офлайн-мокирование (Graceful Fallback). Запрос завершается успешно со статусом 200.

3. **Сбой соединения с Supabase PostgreSQL**
   - *Симптом:* Логи в Vercel: `Failed to persist run in Supabase`.
   - *Диагностика:* Проверить переменные `NEXT_PUBLIC_SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`.
   - *Восстановление:* Приложение автоматически обслуживает чтение из In-Memory кэша L1, не краша интерфейс пользователя.

---

## 4. Rollback & Deployment Checklist

### Деплой в Production:
1. Запустить локальные тесты: `npm test -- --run` (должно быть 85 passed).
2. Запустить production сборку: `npm run build` (0 ошибок компиляции).
3. Пуш в `origin/main` автоматически триггерит Vercel CI/CD пайплайн.
4. Проверка доступности: `curl -I https://adsy-ai-visibility.vercel.app/` (HTTP/2 200).

### Откат (Rollback):
- **Мгновенный откат в Vercel UI:** В панели Vercel перейти в *Deployments* ➔ выбрать предыдущий стабильный релиз (`92680ff` или `v1.0.0-stable`) ➔ нажать *Promote to Production*.
- **Откат через Git:**
  ```bash
  git checkout backup/pre-concept2
  # или
  git checkout tags/v1.0.0-stable
  git push -f origin main
  ```

---

## 5. Документация и ссылки воркспейса

- **Архитектура:** [`adsy-ai-visibility/docs/ARCHITECTURE.md`](file:///Users/yevhen/ADSY/adsy-ai-visibility/docs/ARCHITECTURE.md)
- **Спецификация API:** [`adsy-ai-visibility/docs/API_REFERENCE.md`](file:///Users/yevhen/ADSY/adsy-ai-visibility/docs/API_REFERENCE.md)
- **Техническое задание v2.0:** [`adsy-ai-visibility/docs/PRODUCT_SPEC_TZ.md`](file:///Users/yevhen/ADSY/adsy-ai-visibility/docs/PRODUCT_SPEC_TZ.md)
- **Скилл Движка:** [`.agents/skills/adsy-ai-visibility-engine/SKILL.md`](file:///Users/yevhen/ADSY/.agents/skills/adsy-ai-visibility-engine/SKILL.md)
- **Скилл Интеграции с CP:** [`.agents/skills/adsy-ai-visibility-cp-integration/SKILL.md`](file:///Users/yevhen/ADSY/.agents/skills/adsy-ai-visibility-cp-integration/SKILL.md)
- **README проекта:** [`adsy-ai-visibility/README.md`](file:///Users/yevhen/ADSY/adsy-ai-visibility/README.md)
