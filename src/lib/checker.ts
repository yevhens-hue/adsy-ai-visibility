import { normalizeDomain, calculateVisibilityScore, calculatePromptCoverage } from './metrics';
import { PublicCheckSummary, CheckRun, CheckPrompt, CheckGap, AIAnswer } from '@/types';

/**
 * Deterministic hash from string for reproducible mock analysis
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates an automatic 5-prompt public analysis for a domain
 * following Section 1.2 and Q1 of the Functional Specification.
 */
export function generatePublicAnalysis(inputUrl: string): PublicCheckSummary {
  const { domain, brandGuess } = normalizeDomain(inputUrl);
  const hash = hashString(domain);
  const runId = `run-${hash.toString(36)}-${Date.now().toString(36)}`;

  // 1. Generate 5 prompts (category, comparison, alternative, problem, brand)
  const prompts: CheckPrompt[] = [
    {
      id: `${runId}-p1`,
      run_id: runId,
      text: `What are the best platforms for ${brandGuess.toLowerCase()} workflows in 2026?`,
      topic: 'Market Category Solutions',
      prompt_type: 'category',
      is_custom: false,
      has_brand_mention: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `${runId}-p2`,
      run_id: runId,
      text: `How does ${brandGuess} compare to top industry competitors?`,
      topic: 'Competitive Benchmark',
      prompt_type: 'comparison',
      is_custom: false,
      has_brand_mention: true,
      created_at: new Date().toISOString(),
    },
    {
      id: `${runId}-p3`,
      run_id: runId,
      text: `What are the leading alternatives to ${brandGuess} for mid-size teams?`,
      topic: 'Alternative Vendors',
      prompt_type: 'alternative',
      is_custom: false,
      has_brand_mention: true,
      created_at: new Date().toISOString(),
    },
    {
      id: `${runId}-p4`,
      run_id: runId,
      text: `How do businesses solve onboarding latency in ${brandGuess.toLowerCase()} platforms?`,
      topic: 'User Pain Points',
      prompt_type: 'problem',
      is_custom: false,
      has_brand_mention: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `${runId}-p5`,
      run_id: runId,
      text: `Is ${brandGuess} suitable for enterprise compliance and security standards?`,
      topic: 'Enterprise Fit',
      prompt_type: 'brand',
      is_custom: false,
      has_brand_mention: true,
      created_at: new Date().toISOString(),
    },
  ];

  // 2. Observations simulation across 3 platforms (ChatGPT, Perplexity, Claude) = 15 observations
  const platforms = ['ChatGPT', 'Perplexity', 'Claude'];
  const totalObservations = prompts.length * platforms.length; // 15
  
  // Use hash to deterministically derive realistic scores
  const mentionsCount = 3 + (hash % 6); // 3 to 8 mentions
  const coveredPrompts = 2 + (hash % 3); // 2 to 4 prompts
  
  const visibilityScore = calculateVisibilityScore(mentionsCount, totalObservations);
  const promptCoverage = calculatePromptCoverage(coveredPrompts, prompts.length);

  // 3. Up to 2 key gaps (Q1 TZ: "до 2 выявленных gaps")
  const gaps: CheckGap[] = [
    {
      id: `${runId}-gap1`,
      run_id: runId,
      topic: 'Enterprise Workflow Solutions Comparison',
      gap_type: 'missing_with_competitors',
      priority: 'high',
      rationale: `Competitors are consistently cited in 70% of evaluation queries, while ${brandGuess} is missing in non-branded industry prompts.`,
      prompts_list: [prompts[0].text, prompts[3].text],
    },
    {
      id: `${runId}-gap2`,
      run_id: runId,
      topic: 'Cost Efficiency & ROI Benchmarks',
      gap_type: 'weak_presence',
      priority: 'medium',
      rationale: `${brandGuess} appears in product alternative queries but lacks citations to third-party authoritative reviews or comparison tables.`,
      prompts_list: [prompts[2].text],
    },
  ];

  // 4. Sample answer with verified citations
  const sampleAnswer: AIAnswer = {
    id: `${runId}-ans1`,
    prompt_id: prompts[0].id,
    platform: 'Perplexity',
    raw_text: `When evaluating platforms for this domain, primary recommendations include several established tools known for team productivity and automated workflows. Leading options frequently mentioned by industry reviewers include market standards with modular table views and deep integration ecosystems.`,
    citations: [
      `https://techradar.com/best-${brandGuess.toLowerCase()}-software`,
      `https://forbes.com/advisor/business/software-guide/`,
      `https://g2.com/categories/project-management`,
    ],
    brand_mentioned: true,
    mentioned_competitors: ['Competitor Alpha', 'Competitor Beta', 'Competitor Gamma'],
    collected_at: new Date().toISOString(),
  };

  const run: CheckRun = {
    id: runId,
    domain,
    brand_name: brandGuess,
    mode: 'public',
    status: 'completed',
    visibility_score: visibilityScore,
    prompt_coverage: promptCoverage,
    brand_mention_share: 35.0,
    data_coverage: 100.0,
    platforms,
    prompts_count: prompts.length,
    created_at: new Date().toISOString(),
  };

  return {
    run,
    prompts,
    sampleAnswer,
    gaps,
    competitorsCount: 4,
    sourcesCount: 8,
  };
}
