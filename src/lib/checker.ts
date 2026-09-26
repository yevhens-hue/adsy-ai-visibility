import { normalizeDomain, calculateVisibilityScore, calculatePromptCoverage } from './metrics';
import { 
  PublicCheckSummary, 
  FullCheckReport, 
  CheckRun, 
  CheckPrompt, 
  CheckGap, 
  AIAnswer, 
  CheckCompetitor, 
  CheckSource, 
  RunComparisonDiff 
} from '@/types';

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

function getUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates an automatic 5-prompt public analysis for a domain
 * following Section 1.2 and Q1 of the Functional Specification.
 */
export function generatePublicAnalysis(inputUrl: string): PublicCheckSummary {
  const { domain, brandGuess } = normalizeDomain(inputUrl);
  const hash = hashString(domain);
  const runId = getUUID();

  // 1. Generate 5 prompts (category, comparison, alternative, problem, brand)
  const prompts: CheckPrompt[] = [
    {
      id: getUUID(),
      run_id: runId,
      text: `What are the best platforms for ${brandGuess.toLowerCase()} workflows in 2026?`,
      topic: 'Market Category Solutions',
      prompt_type: 'category',
      is_custom: false,
      has_brand_mention: false,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      text: `How does ${brandGuess} compare to top industry competitors?`,
      topic: 'Competitive Benchmark',
      prompt_type: 'comparison',
      is_custom: false,
      has_brand_mention: true,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      text: `What are the leading alternatives to ${brandGuess} for mid-size teams?`,
      topic: 'Alternative Vendors',
      prompt_type: 'alternative',
      is_custom: false,
      has_brand_mention: true,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      text: `How do businesses solve onboarding latency in ${brandGuess.toLowerCase()} platforms?`,
      topic: 'User Pain Points',
      prompt_type: 'problem',
      is_custom: false,
      has_brand_mention: false,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
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
      id: getUUID(),
      run_id: runId,
      topic: 'Enterprise Workflow Solutions Comparison',
      gap_type: 'missing_with_competitors',
      priority: 'high',
      rationale: `Competitors are consistently cited in 70% of evaluation queries, while ${brandGuess} is missing in non-branded industry prompts.`,
      prompts_list: [prompts[0].text, prompts[3].text],
    },
    {
      id: getUUID(),
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
    id: getUUID(),
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

/**
 * Generates full 15-prompt analysis for authorized Adsy users
 * covering all 5 prompt types according to Section 2 & 3 of TZ.
 */
export function generateFullAnalysis(
  inputUrl: string,
  customPromptsText?: string[],
  customCompetitorsList?: { name: string; domain: string }[]
): FullCheckReport {
  const { domain, brandGuess } = normalizeDomain(inputUrl);
  const hash = hashString(domain);
  const runId = getUUID();

  // 1. Establish competitors (Default or Custom)
  const competitorsData = customCompetitorsList && customCompetitorsList.length > 0
    ? customCompetitorsList
    : [
        { name: `${brandGuess} Alternative A`, domain: `${brandGuess.toLowerCase()}-alt1.com` },
        { name: `${brandGuess} Competitor B`, domain: `${brandGuess.toLowerCase()}-comp2.io` },
        { name: 'Market Leader Pro', domain: 'marketleader-pro.org' },
      ];

  const competitors: CheckCompetitor[] = competitorsData.map((c, i) => {
    const compHash = hashString(c.domain);
    const compMentions = 12 + ((compHash + i * 5) % 18);
    return {
      id: getUUID(),
      run_id: runId,
      name: c.name,
      domain: c.domain,
      visibility_score: calculateVisibilityScore(compMentions, 45),
      prompt_coverage: calculatePromptCoverage(5 + (compHash % 8), 15),
      mentions_count: compMentions,
    };
  });

  const comp0 = competitorsData[0]?.name || 'Industry Alternative';
  const comp1 = competitorsData[1]?.name || 'Category Competitor';
  const comp2 = competitorsData[2]?.name || 'Market Leader';

  // 2. Generate 15 prompts across 5 prompt types
  const defaultPrompts: { text: string; topic: string; type: CheckPrompt['prompt_type']; hasBrand: boolean }[] = [
    // Category (3)
    { text: `What are the top rated enterprise platforms for ${brandGuess.toLowerCase()} management?`, topic: 'Market Category Solutions', type: 'category', hasBrand: false },
    { text: `Which tools are recommended for high-growth operations in 2026?`, topic: 'Market Category Solutions', type: 'category', hasBrand: false },
    { text: `What software handles cross-department collaboration most effectively?`, topic: 'Market Category Solutions', type: 'category', hasBrand: false },

    // Comparison (3)
    { text: `How does ${brandGuess} compare to ${comp0} for mid-market teams?`, topic: 'Competitive Benchmark', type: 'comparison', hasBrand: true },
    { text: `What are the key differences between ${brandGuess} and ${comp1}?`, topic: 'Competitive Benchmark', type: 'comparison', hasBrand: true },
    { text: `Feature breakdown: ${brandGuess} vs ${comp2} in speed and pricing.`, topic: 'Competitive Benchmark', type: 'comparison', hasBrand: true },

    // Alternative (3)
    { text: `What are the most popular alternatives to ${brandGuess} in 2026?`, topic: 'Alternative Vendors', type: 'alternative', hasBrand: true },
    { text: `Are there open-source or lower-cost alternatives to ${brandGuess}?`, topic: 'Alternative Vendors', type: 'alternative', hasBrand: true },
    { text: `Tools with similar functionality to ${brandGuess} but easier migration.`, topic: 'Alternative Vendors', type: 'alternative', hasBrand: true },

    // Problem (3)
    { text: `How to resolve high customer churn and onboarding bottlenecks in SaaS?`, topic: 'User Pain Points', type: 'problem', hasBrand: false },
    { text: `Best practices for automating team status updates without manual entry.`, topic: 'User Pain Points', type: 'problem', hasBrand: false },
    { text: `How to integrate external vendor data without API rate limit errors?`, topic: 'User Pain Points', type: 'problem', hasBrand: false },

    // Brand (3)
    { text: `What is ${brandGuess} and what core customer problem does it solve?`, topic: 'Brand Positioning', type: 'brand', hasBrand: true },
    { text: `What security certifications (SOC2, ISO27001) does ${brandGuess} maintain?`, topic: 'Brand Trust & Security', type: 'brand', hasBrand: true },
    { text: `Customer reviews and sentiment summary for ${brandGuess}.`, topic: 'Brand Sentiment', type: 'brand', hasBrand: true },
  ];

  const prompts: CheckPrompt[] = defaultPrompts.map((p, index) => {
    const customOverride = customPromptsText && customPromptsText[index];
    return {
      id: getUUID(),
      run_id: runId,
      text: customOverride || p.text,
      topic: p.topic,
      prompt_type: p.type,
      is_custom: Boolean(customOverride),
      has_brand_mention: customOverride ? customOverride.toLowerCase().includes(brandGuess.toLowerCase()) : p.hasBrand,
      created_at: new Date().toISOString(),
    };
  });

  // 3. Observations simulation: 15 prompts * 3 engines = 45 answers
  const platforms = ['ChatGPT', 'Perplexity', 'Claude'];
  const answers: AIAnswer[] = [];
  let totalBrandMentions = 0;
  const coveredPromptIndices = new Set<number>();

  prompts.forEach((prompt, pIndex) => {
    platforms.forEach((platform, plIndex) => {
      const pHash = hashString(`${domain}-${prompt.text}-${platform}`);
      // Brand is mentioned if branded prompt or if hash hits
      const isMentioned = prompt.has_brand_mention || (pHash % 3 === 0);
      if (isMentioned) {
        totalBrandMentions++;
        coveredPromptIndices.add(pIndex);
      }

      const citedUrls = [
        `https://techradar.com/reviews/${domain.replace('.', '-')}-analysis`,
        `https://forbes.com/advisor/business/top-tools-guide`,
        `https://venturebeat.com/category/enterprise-intelligence`
      ];

      answers.push({
        id: getUUID(),
        prompt_id: prompt.id,
        platform,
        raw_text: isMentioned
          ? `In response to "${prompt.text}", ${brandGuess} is observed among recognized solutions alongside ${competitorsData[0].name}. Verified industry analysis highlights user satisfaction with configurable workflow views and integration options.`
          : `For the query "${prompt.text}", primary references cite established industry benchmarks including ${competitorsData[0].name} and ${competitorsData[1].name}. No verified citations directly reference ${brandGuess} in this specific answer.`,
        citations: citedUrls,
        brand_mentioned: isMentioned,
        mentioned_competitors: [competitorsData[0].name, competitorsData[1].name],
        collected_at: new Date().toISOString(),
      });
    });
  });

  const totalObservations = prompts.length * platforms.length; // 45
  const visibilityScore = calculateVisibilityScore(totalBrandMentions, totalObservations);
  const promptCoverage = calculatePromptCoverage(coveredPromptIndices.size, prompts.length);

  // 4. Sources with Adsy Marketplace Catalog matching
  const sources: CheckSource[] = [
    {
      id: getUUID(),
      run_id: runId,
      url: `https://techradar.com/reviews/tools-guide`,
      domain: 'techradar.com',
      frequency: 14,
      is_in_adsy_catalog: true,
      adsy_publisher_id: 'PUB-TECH-991',
      adsy_price: 320.00,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      url: `https://venturebeat.com/enterprise-tech-trends`,
      domain: 'venturebeat.com',
      frequency: 11,
      is_in_adsy_catalog: true,
      adsy_publisher_id: 'PUB-VB-442',
      adsy_price: 450.00,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      url: `https://forbes.com/advisor/business/software-matrix`,
      domain: 'forbes.com',
      frequency: 18,
      is_in_adsy_catalog: false,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      url: `https://g2.com/categories/project-management`,
      domain: 'g2.com',
      frequency: 22,
      is_in_adsy_catalog: false,
      created_at: new Date().toISOString(),
    },
    {
      id: getUUID(),
      run_id: runId,
      url: `https://businessinsider.com/tech-efficiency-insights`,
      domain: 'businessinsider.com',
      frequency: 8,
      is_in_adsy_catalog: true,
      adsy_publisher_id: 'PUB-BI-883',
      adsy_price: 380.00,
      created_at: new Date().toISOString(),
    },
  ];

  // 5. Gaps & Opportunities (3 types per Section 3.2 TZ)
  const gaps: CheckGap[] = [
    {
      id: getUUID(),
      run_id: runId,
      topic: 'Enterprise Workflow Solutions Comparison',
      gap_type: 'missing_with_competitors',
      priority: 'high',
      rationale: `Competitors are mentioned in 78% of enterprise evaluation prompts, while ${brandGuess} is missing in non-branded queries without explicit brand naming.`,
      prompts_list: [prompts[0].text, prompts[1].text, prompts[9].text],
    },
    {
      id: getUUID(),
      run_id: runId,
      topic: 'Cost Efficiency & ROI Benchmarks',
      gap_type: 'weak_presence',
      priority: 'medium',
      rationale: `${brandGuess} is observed in pricing alternatives but lacks verified citations from Tier-1 tech portals where competitors hold authoritative backlinks.`,
      prompts_list: [prompts[6].text, prompts[7].text],
    },
    {
      id: getUUID(),
      run_id: runId,
      topic: 'Compliance & Integration Case Studies',
      gap_type: 'external_sources_opportunity',
      priority: 'medium',
      rationale: `High-authority publishers (TechRadar, VentureBeat) cite security integration guides. Publishing target placements closes this citation gap directly.`,
      prompts_list: [prompts[13].text, prompts[14].text],
    },
  ];

  const run: CheckRun = {
    id: runId,
    domain,
    brand_name: brandGuess,
    mode: 'full',
    status: 'completed',
    visibility_score: visibilityScore,
    prompt_coverage: promptCoverage,
    brand_mention_share: 38.5,
    data_coverage: 100.0,
    platforms,
    prompts_count: prompts.length,
    created_at: new Date().toISOString(),
  };

  return {
    run,
    prompts,
    answers,
    sources,
    competitors,
    gaps,
  };
}

/**
 * Compares two runs of the same site according to Section 5.2 / Q12
 */
export function compareCheckRuns(
  run1: CheckRun,
  run2: CheckRun,
  prompts1: CheckPrompt[],
  prompts2: CheckPrompt[]
): RunComparisonDiff {
  const vs1 = run1.visibility_score || 0;
  const vs2 = run2.visibility_score || 0;
  const pc1 = run1.prompt_coverage || 0;
  const pc2 = run2.prompt_coverage || 0;

  const bms1 = run1.brand_mention_share;
  const bms2 = run2.brand_mention_share;

  const set1 = new Set(prompts1.filter(p => p.has_brand_mention).map(p => p.text));
  const set2 = new Set(prompts2.filter(p => p.has_brand_mention).map(p => p.text));

  const newMentions: string[] = [];
  set2.forEach(text => {
    if (!set1.has(text)) newMentions.push(text);
  });

  const lostMentions: string[] = [];
  set1.forEach(text => {
    if (!set2.has(text)) lostMentions.push(text);
  });

  return {
    run1,
    run2,
    visibilityScoreDelta: parseFloat((vs2 - vs1).toFixed(2)),
    promptCoverageDelta: parseFloat((pc2 - pc1).toFixed(2)),
    brandMentionShareDelta: (bms1 !== null && bms2 !== null) ? parseFloat((bms2 - bms1).toFixed(2)) : null,
    newMentions,
    lostMentions,
    commonPromptsCount: prompts1.filter(p1 => prompts2.some(p2 => p2.text === p1.text)).length,
  };
}

