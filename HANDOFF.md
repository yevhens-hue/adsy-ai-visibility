# 📑 Engineering Continuity & System Handoff — Adsy AI Visibility

**Project:** `adsy-ai-visibility`  
**Production URL:** [https://adsy-ai-visibility.vercel.app](https://adsy-ai-visibility.vercel.app)  
**Repository:** `/Users/yevhen/ADSY/adsy-ai-visibility` (remote: `https://github.com/yevhens-hue/adsy-ai-visibility.git`)  
**Commit Baseline:** `e5cb19d` (Branch: `main`, Synced with `origin/main`)  
**Timestamp:** 2026-09-27 02:30 CEST  

---

## 1. 🗺️ System Map & Component Topology

```
adsy-ai-visibility (Next.js 16 App Router / TypeScript)
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Main Cockpit: Checker, Inventory, History, Competitor Benchmark
│   │   ├── layout.tsx                    # Inter font, metadata, viewport
│   │   ├── globals.css                   # Adsy enterprise design system tokens
│   │   └── api/
│   │       ├── check/public/route.ts     # 5-prompt rapid evaluation (Public/Guest mode)
│   │       ├── check/full/route.ts       # 45-prompt deep audit (Marketer mode, 3/month quota)
│   │       ├── inventory/route.ts        # Publisher catalog with AI citation overlay
│   │       ├── runs/route.ts             # Supabase audit run history & single-run details
│   │       └── brief/save/route.ts       # Copy brief & save placement intent
│   ├── components/
│   │   ├── AdsyHeader.tsx                # Adsy Marketer CP navigation header
│   │   ├── AdsySidebar.tsx               # Adsy navigation sidebar
│   │   ├── CheckerTab.tsx                # Audit progress, radar charts, citation sources, gaps
│   │   ├── CatalogTab.tsx                # Embedded catalog viewer
│   │   ├── HistoryTab.tsx                # Historical run comparison & delta metrics
│   │   ├── PublisherInventoryTable.tsx   # Verified publisher table, filter chips, gap relevance
│   │   ├── PlacementBriefModal.tsx       # AI prompt placement brief modal with clipboard copy
│   │   └── ReportComparisonModal.tsx     # Side-by-side run delta analysis
│   └── lib/
│       ├── adsy-catalog.ts               # Canonical Adsy catalog: 20+ verified domains, IDs, live prices
│       ├── real-ai.ts                    # LLM multi-engine orchestration (GPT-4o-mini, Sonar, Haiku)
│       ├── checker.ts                    # Observation parsers, brand detection, fallback eval data
│       ├── metrics.ts                    # Visibility Score, Coverage, Brand Share, Gaps
│       ├── supabase.ts                   # Supabase client (`kapkqziyceefxluxlvqc.supabase.co`)
│       └── rate-limiter.ts               # Sliding window rate limiter for public API
```

---

## 2. 🧪 Verified vs Unverified Status Matrix

| Component / Feature | Test Command / Proof | Runtime Status | Verdict |
|---|---|---|---|
| **Unit & Integration Suite** | `npm test` (17 test files, 63 tests) | All 63 pass cleanly (17.90s) | ✅ VERIFIED |
| **Production Build** | `npm run build` | Zero TypeScript errors, static & dynamic routes compiled | ✅ VERIFIED |
| **Production Deployment** | `npx vercel --prod --yes` | Aliased to `https://adsy-ai-visibility.vercel.app` | ✅ VERIFIED |
| **Adsy Catalog Alignment** | `src/lib/adsy-catalog.ts` | 20+ verified publishers, real CP IDs (`97966`, `60417`, etc.), live prices ($320, $1250, $1529.18) | ✅ VERIFIED |
| **Dynamic Niche Gaps** | `curl -X POST .../api/check/public` | `business2community.com` → "Emerging AI Technologies", `zillow.com` → "Real Estate Trends" | ✅ VERIFIED |
| **Category Overwrite Fix** | Live inspect `/api/inventory` | Real categories displayed (*Technology & Software Systems*, *Enterprise AI*), zero synthetic `[Brand] AI Citations` | ✅ VERIFIED |
| **Live Registration / Blog Links** | `CheckerTab.tsx` / `PublisherInventoryTable.tsx` | All case proof and sign-up buttons point to valid `adsy.com/blog` and `adsy.com/sign-up` | ✅ VERIFIED |
| **Guest Quota & Rate Limit** | `src/lib/rate-limiter.test.ts` | 3 full checks per month per user, 10 req/min for public IP | ✅ VERIFIED |
| **Live Database Migration** | `scripts/supabase_migration_ai_visibility.sql` | Tables `check_runs`, `check_prompts`, `check_answers`, `check_sources`, `check_gaps` live on Supabase | ✅ VERIFIED |
| *Edge Case: 0/3 Remaining Quota UI* | Visual inspection | Shows exhausted banner, prevents new full runs until next month | ⚠️ UNVERIFIED in live prod end-of-month rollover |

---

## 3. 🚨 Runtime Diagnostics & Failure Recovery

### A. LLM Engine Outage / Missing API Keys
- **Behavior:** `real-ai.ts` catches API errors and falls back to deterministic multi-engine simulation (`generateFallbackEvalData`) with niche-grounded keywords, preventing user-facing 500 errors.
- **Diagnostics:** Check Vercel Function logs: `vercel logs adsy-ai-visibility.vercel.app`. Look for `[OpenAI Error]`, `[Perplexity Error]`, or `[Claude Error]`.

### B. Supabase Read/Write Degradation
- **Behavior:** If Supabase returns an error or credentials expire, routes degrade gracefully: public check returns completed JSON without database persistence, and UI functions with local state.
- **Recovery:** Verify environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### C. Stale 24h Cache Hit
- **Behavior:** `real-ai.ts` checks for completed runs for the domain within 24h. If an existing run is found, it returns the stored run.
- **Bypass:** Append query or run with custom prompts / marketer mode to force a fresh analysis.

---

## 4. 🚀 Rollback & Deployment Checklist

1. **Commit & Push:**
   ```bash
   git add -A
   git commit -m "fix(scope): description"
   git push origin main
   ```
2. **Production Deploy via Vercel CLI (or automatic GitHub CI):**
   ```bash
   npx vercel --prod --yes
   ```
3. **Emergency Rollback:**
   ```bash
   # Instant instant rollback to previous healthy deployment via Vercel CLI:
   npx vercel rollback
   # Or via Git:
   git revert HEAD
   git push origin main
   npx vercel --prod --yes
   ```
4. **Post-Deploy Sanity Ping:**
   ```bash
   curl -s -X POST https://adsy-ai-visibility.vercel.app/api/check/public \
     -H "Content-Type: application/json" \
     -d '{"url":"business2community.com","guestSessionId":"smoke-test"}' | grep -o '"success":true'
   ```
