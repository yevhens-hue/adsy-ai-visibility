# 🤖 Adsy AI Visibility & Media Gap Matcher

> **Live Production:** [https://adsy-ai-visibility.vercel.app/](https://adsy-ai-visibility.vercel.app/)  
> **Repository:** [https://github.com/yevhens-hue/adsy-ai-visibility](https://github.com/yevhens-hue/adsy-ai-visibility)  
> **Specification:** Compliant with `Adsy_AI_Visibility_Concept-2.pptx` (22 slides)

---

## 🎯 What is Adsy AI Visibility?
Adsy AI Visibility evaluates brand presence and citation footprints across leading generative search engines (**ChatGPT, Perplexity, Claude**). It surfaces strategic content gaps where competitors dominate AI recommendations and bridges them directly into verified publisher placements via the **Adsy Catalog** in a single click.

---

## 🚀 Key Features

* **Guest vs Marketer Modes (Slides 4, 6, 20):**
  * `Guest (Public)`: 5 automated queries, up to 2 strategic gaps, 1 sample AI answer, **Competitors locked** under gated blur overlay.
  * `Marketer (Buyer Account)`: Full 15-query audit across 3 engines (45 verified observations), custom search prompts and competitor benchmarks.
* **Live Web Grounding:** Organically indexes live citations and direct URLs via Tavily Search API.
* **Adsy Catalog Matching (Slide 13):** Distinguishes `Exact AI Source in Adsy` from `Thematic Catalog Alternative`.
* **Automated Placement Brief (Slide 15):** Generates structured article requirements with direct cart deep-links (`cp.adsy.com/marketer/platform/choose-product/{id}?brief=...&gap=...`).
* **Historical Diff Comparison (Slide 18):** Select any two runs to compare Visibility Score deltas, new mentions, and lost citations.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 16 (App Router), React 19, TypeScript
* **Styling:** Adsy Control Panel Design Tokens (Vanilla CSS / Module CSS)
* **Database & Cache:** Supabase (PostgreSQL) — L1 Memory + L2 DB Cache
* **Search Grounding:** Tavily Live Web Search API
* **Testing:** Vitest + React Testing Library (85 tests, 19 files, 100% pass)
* **Hosting:** Vercel Production + GitHub CI/CD

---

## 📂 Project Documentation

Detailed engineering and product documentation is available in the `docs/` folder:
* [Architecture Overview (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)
* [API Reference (`docs/API_REFERENCE.md`)](./docs/API_REFERENCE.md)
* [Updated Product Specification & ТЗ (`docs/PRODUCT_SPEC_TZ.md`)](./docs/PRODUCT_SPEC_TZ.md)

---

## 🏃 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and set:
```bash
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Run Test Suite
```bash
npm test -- --run
```

### 5. Production Build
```bash
npm run build
```
