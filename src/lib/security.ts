/**
 * Security & Hardening Core Module
 * Enforces SSRF defense, domain validation, and Prompt Injection sanitization.
 */

// Private & reserved IPv4 patterns
const PRIVATE_IPV4_REGEX = /^(?:0\.|10\.|127\.|169\.254\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|255\.255\.255\.255)/;

// Disallowed internal / pseudo TLDs
const BLOCKED_INTERNAL_TLDS = new Set([
  'local',
  'localhost',
  'internal',
  'lan',
  'home',
  'corp',
  'arpa',
  'test',
  'example',
  'invalid',
]);

// Dangerous schemes that must never be processed
const DANGEROUS_SCHEMES_REGEX = /^(javascript|data|file|vbscript|blob|about):/i;

// Forbidden shell and injection characters
const INJECTION_CHARS_REGEX = /[;`$&|<>"'{}\\]/;

/**
 * Validates and normalizes domain input.
 * Blocks SSRF, cloud metadata, private IPs, non-standard ports, and injection characters.
 */
export function validateAndSanitizeDomain(rawInput: unknown): {
  valid: boolean;
  domain?: string;
  error?: string;
} {
  if (typeof rawInput !== 'string') {
    return { valid: false, error: 'Domain must be a string' };
  }

  const trimmed = rawInput.trim();
  if (!trimmed || trimmed.length > 253) {
    return { valid: false, error: 'Domain must be between 1 and 253 characters' };
  }

  // Block dangerous schemes
  if (DANGEROUS_SCHEMES_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid or dangerous protocol scheme' };
  }

  // Block command injection / script characters
  if (INJECTION_CHARS_REGEX.test(trimmed)) {
    return { valid: false, error: 'Domain contains invalid characters' };
  }

  // Remove protocol if present
  let cleaned = trimmed.replace(/^https?:\/\//i, '');

  // Strip path, query, hash
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0].trim().toLowerCase();

  // Strip trailing dot or port check
  if (cleaned.includes(':')) {
    return { valid: false, error: 'Custom ports are not allowed' };
  }

  // Remove leading www.
  cleaned = cleaned.replace(/^www\./i, '');

  if (!cleaned) {
    return { valid: false, error: 'Domain cannot be empty' };
  }

  // Block known localhost aliases
  if (cleaned === 'localhost' || cleaned === '0.0.0.0') {
    return { valid: false, error: 'Localhost and private addresses are forbidden' };
  }

  // Block IPv4 format (both private and public IPs - only FQDN domains allowed)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleaned)) {
    return { valid: false, error: 'Direct IP addresses are not permitted' };
  }

  // Block IPv6 formats
  if (cleaned.includes(':') || cleaned.startsWith('[') || cleaned === '::1') {
    return { valid: false, error: 'IPv6 addresses are not permitted' };
  }

  // Domain structure validation: RFC 1035 labels separated by dots
  const labels = cleaned.split('.');
  if (labels.length < 2) {
    return { valid: false, error: 'Domain must have a valid Top-Level Domain (TLD)' };
  }

  const tld = labels[labels.length - 1];
  if (BLOCKED_INTERNAL_TLDS.has(tld)) {
    return { valid: false, error: `TLD .${tld} is not a public domain` };
  }

  // Valid TLD: letters only, 2-24 characters
  if (!/^[a-z]{2,24}$/.test(tld)) {
    return { valid: false, error: 'Invalid Top-Level Domain' };
  }

  // Validate each label (1-63 chars, alphanumeric with internal hyphens)
  for (const label of labels) {
    if (!label || label.length > 63) {
      return { valid: false, error: 'Domain labels must be between 1 and 63 characters' };
    }
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)) {
      return { valid: false, error: `Invalid domain label: ${label}` };
    }
  }

  return { valid: true, domain: cleaned };
}

/**
 * Checks if a URL or domain is safe for server-side HTTP fetch (SSRF Protection).
 */
export function isSafeUrlForFetch(urlOrDomain: string): boolean {
  const result = validateAndSanitizeDomain(urlOrDomain);
  if (!result.valid || !result.domain) {
    return false;
  }

  // Extra check for private IPv4
  if (PRIVATE_IPV4_REGEX.test(result.domain)) {
    return false;
  }

  return true;
}

// Patterns commonly used in prompt injection attacks
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous\s+|prior\s+)?instructions/gi,
  /disregard\s+(?:all\s+)?(?:previous\s+|prior\s+)?directives/gi,
  /system\s+prompt/gi,
  /reveal\s+(?:your\s+)?api\s+key/gi,
  /output\s+(?:all\s+)?(?:secrets?|tokens?|keys?)/gi,
  /you\s+are\s+now\s+(?:an?\s+)?unfiltered/gi,
  /jailbreak/gi,
  /DAN\s+mode/gi,
];

/**
 * Sanitizes user prompt inputs, stripping known jailbreaks and capping length.
 */
export function sanitizePromptInput(input: unknown, maxLength = 150): string {
  if (typeof input !== 'string') return '';

  let sanitized = input
    .replace(/[<>]/g, '') // Strip XML/HTML tags that could break prompt delimiters
    .trim();

  // Strip injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }

  return sanitized.slice(0, maxLength);
}

/**
 * Sanitizes scraped external HTML metadata before injecting into LLM context.
 */
export function sanitizeMetadataSnippet(text?: string, maxLength = 250): string {
  if (!text || typeof text !== 'string') return '';

  // Decode common HTML entities
  let clean = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Strip script, style, and HTML tags
  clean = clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Neutralize prompt injection phrases in metadata
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    clean = clean.replace(pattern, '');
  }

  // Strip potential XML prompt delimiters
  clean = clean.replace(/<\/?(?:untrusted_site_metadata|system|instruction|rules)>/gi, '');

  return clean.slice(0, maxLength);
}
