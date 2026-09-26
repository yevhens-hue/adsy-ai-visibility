export type CheckStatus = 'draft' | 'queued' | 'running' | 'completed' | 'partial' | 'failed';
export type CheckMode = 'public' | 'full';

export interface Site {
  id: string;
  user_id?: string;
  domain: string;
  brand_name: string;
  description?: string;
  aliases: string[];
  country: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface CheckRun {
  id: string;
  site_id?: string;
  domain: string;
  brand_name: string;
  guest_session_id?: string;
  mode: CheckMode;
  status: CheckStatus;
  visibility_score: number | null;
  prompt_coverage: number | null;
  brand_mention_share: number | null;
  data_coverage: number;
  platforms: string[];
  prompts_count: number;
  error_message?: string;
  created_at: string;
}

export interface CheckPrompt {
  id: string;
  run_id: string;
  text: string;
  topic: string;
  prompt_type: 'category' | 'comparison' | 'alternative' | 'problem' | 'brand';
  is_custom: boolean;
  has_brand_mention: boolean;
  created_at: string;
}

export interface AIAnswer {
  id: string;
  prompt_id: string;
  platform: string;
  raw_text: string;
  citations: string[];
  brand_mentioned: boolean;
  mentioned_competitors: string[];
  collected_at: string;
}

export interface CheckSource {
  id: string;
  run_id: string;
  url: string;
  domain: string;
  frequency: number;
  is_in_adsy_catalog: boolean;
  adsy_publisher_id?: string;
  adsy_price?: number;
  created_at: string;
}

export interface CheckCompetitor {
  id: string;
  run_id: string;
  name: string;
  domain: string;
  visibility_score: number | null;
  prompt_coverage: number | null;
  mentions_count: number;
}

export interface CheckGap {
  id: string;
  run_id: string;
  topic: string;
  gap_type: 'missing_with_competitors' | 'weak_presence' | 'external_sources_opportunity';
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  prompts_list: string[];
}

export interface PublicCheckSummary {
  run: CheckRun;
  prompts: CheckPrompt[];
  sampleAnswer?: AIAnswer;
  gaps: CheckGap[];
  competitorsCount: number;
  sourcesCount: number;
}

export interface FullCheckReport {
  run: CheckRun;
  site?: Site;
  prompts: CheckPrompt[];
  answers: AIAnswer[];
  sources: CheckSource[];
  competitors: CheckCompetitor[];
  gaps: CheckGap[];
}

export interface RunComparisonDiff {
  run1: CheckRun;
  run2: CheckRun;
  visibilityScoreDelta: number; // in percentage points
  promptCoverageDelta: number; // in percentage points
  brandMentionShareDelta: number | null;
  newMentions: string[];
  lostMentions: string[];
  commonPromptsCount: number;
}

export interface PlacementBriefData {
  id: string;
  run_id: string;
  gap_id: string;
  target_brand: string;
  target_domain: string;
  gap_topic: string;
  gap_priority: 'high' | 'medium' | 'low';
  target_prompts: string[];
  publisher_domain: string;
  publisher_price: number;
  why_this_site: string;
  writer_instructions: string;
  reference_sources: string[];
  created_at: string;
}

