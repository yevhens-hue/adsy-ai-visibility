# 🏗️ Архитектура системы: Adsy AI Visibility

**Сервис:** Adsy AI Visibility  
**Хостинг:** Vercel Production (`https://adsy-ai-visibility.vercel.app/`)  
**Стек:** Next.js 16 (App Router), TypeScript, Supabase (PostgreSQL), Tavily Live Search API, Vitest.

---

## 1. Концептуальная диаграмма архитектуры

```
┌─────────────────────────────────────────────────────────────┐
│                    Adsy AI Visibility UI                    │
│   (Guest 5-Query Flow / Marketer 15-Query Full Audit Flow)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        POST /api/check/public         POST /api/check/full
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Route Layer                   │
│      - Zod Domain & Prompt Sanitization (XSS, SSRF)         │
│      - IP-based Rate Limiter (Token Bucket / Sliding Window)│
│      - Monthly Quota Gate (3 Free Audits / Month)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Data Grounding Engine (real-ai.ts)            │
│  1. Check L1 Memory Cache (15 min TTL)                      │
│  2. Check L2 Supabase Cache (24 hour TTL)                   │
│  3. Fetch Live Search Citations via Tavily API              │
│  4. Grounded AI Engine Observations (ChatGPT/Perp/Claude)   │
│  5. Citation Matching against Adsy Known Publisher Catalog  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Supabase PostgreSQL     │ │    Adsy Control Panel (CP)  │
│  - check_runs                │ │  - Cart Deep-Linking URL   │
│  - check_prompts             │ │  - Placement Brief Handoff │
│  - ai_answers                │ │  - SiteSearch Query Sync   │
│  - check_sources             │ └────────────────────────────┘
│  - check_competitors         │
│  - check_gaps                │
└──────────────────────────────┘
```

---

## 2. Слой данных и схема базы данных (Supabase)

### Таблицы:
1. **`check_runs`**: Корневая запись каждого аудита.
   * `id` (UUID), `domain`, `brand_name`, `mode` (`public` | `full`), `visibility_score`, `prompt_coverage`, `data_coverage`, `status`, `created_at`.
2. **`check_prompts`**: Проверенные поисковые запросы.
   * `id` (UUID), `run_id`, `text`, `topic`, `prompt_type` (`brand` | `category` | `comparison`), `has_brand_mention`, `is_custom`.
3. **`ai_answers`**: Сырые и структурированные ответы движков.
   * `id`, `prompt_id`, `platform` (`ChatGPT` | `Perplexity` | `Claude`), `raw_text`, `citations` (array of URLs), `brand_mentioned`, `collected_at`.
4. **`check_sources`**: Авторитетные медиа, цитируемые в ответах.
   * `id`, `run_id`, `domain`, `url`, `frequency`, `is_in_adsy_catalog`, `adsy_price`, `adsy_publisher_id`.
5. **`check_competitors`**: Бенчмарк конкурентов.
   * `id`, `run_id`, `name`, `domain`, `visibility_score`, `prompt_coverage`, `mentions_count`.
6. **`check_gaps`**: Стратегические гэпы в присутствии.
   * `id`, `run_id`, `topic`, `rationale`, `prompts_list`.

---

## 3. Защита, безопасность и лимиты

1. **Санитизация и валидация (`src/lib/schemas.ts`):**
   * Все входящие домены очищаются от протоколов, портов и путей.
   * Блокировка внутренних IP-адресов (`127.0.0.1`, `localhost`, `169.254.169.254`, AWS/GCP metadata) для исключения SSRF-атак.
   * Кастомные промпты ограничиваются 150 символами и очищаются от инъекций.
2. **Rate Limiting (`src/lib/rate-limiter.ts`):**
   * Публичный чекер: не более 10 запросов в минуту на IP.
   * Суточный лимит: 1 живой сбор на домен за 24 часа.
   * Квота маркетера: 3 полных аудита в месяц на учетную запись.

---

## 4. Двухуровневое кэширование (L1 / L2)

* **L1 (Node.js Memory Cache):** Кэширует расчеты на 15 минут в рамках текущей сессии инстанса.
* **L2 (Supabase Persistent DB):** Хранит полные отчеты 24–48 часов. Если пользователь повторно вводит домен без кастомных запросов, данные мгновенно отдаются из базы данных со статусом `HTTP 200` за ~50ms, экономя затраты на внешние API.
