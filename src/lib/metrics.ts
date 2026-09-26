/**
 * Normalizes input URL to domain and derives a clean brand guess.
 */
export function normalizeDomain(input: string): { domain: string; brandGuess: string } {
  let cleaned = input.trim().toLowerCase();
  
  // Remove protocol
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  // Remove www.
  cleaned = cleaned.replace(/^www\./i, '');
  // Remove path, query, hash
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  
  // Derive brand guess from domain SLD (e.g. monday.com -> Monday)
  const parts = cleaned.split('.');
  let brand = parts[0] || 'Brand';
  brand = brand.charAt(0).toUpperCase() + brand.slice(1);
  
  return {
    domain: cleaned,
    brandGuess: brand,
  };
}

/**
 * Visibility Score = Successful observations with brand mention / all successful observations * 100%
 * Returns null if no successful observations (TZ section 2.2: show 'No data', not 0%).
 */
export function calculateVisibilityScore(
  mentionsCount: number,
  totalObservations: number
): number | null {
  if (!totalObservations || totalObservations <= 0) {
    return null;
  }
  return Number(((mentionsCount / totalObservations) * 100).toFixed(2));
}

/**
 * Prompt Coverage = Prompts with brand mention in at least one answer / total answered prompts * 100%
 * Returns null if no answered prompts.
 */
export function calculatePromptCoverage(
  coveredPrompts: number,
  totalPrompts: number
): number | null {
  if (!totalPrompts || totalPrompts <= 0) {
    return null;
  }
  return Number(((coveredPrompts / totalPrompts) * 100).toFixed(2));
}

/**
 * Brand Mention Share = Brand appearances / sum of appearances of all brands in competitive set * 100%
 * Returns null if sum of all brands mentions is 0.
 */
export function calculateBrandMentionShare(
  brandMentions: number,
  totalCompetitiveMentions: number
): number | null {
  if (!totalCompetitiveMentions || totalCompetitiveMentions <= 0) {
    return null;
  }
  return Number(((brandMentions / totalCompetitiveMentions) * 100).toFixed(2));
}
