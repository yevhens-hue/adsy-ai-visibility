import { z } from 'zod';
import { validateAndSanitizeDomain, sanitizePromptInput } from './security';

/**
 * Domain custom Zod validator ensuring FQDN, no SSRF, no dangerous schemes.
 */
/**
 * Domain custom Zod validator ensuring FQDN, no SSRF, no dangerous schemes.
 */
export const DomainSchema = z.string().min(1, 'Please provide a valid website URL or domain').superRefine((val, ctx) => {
  const check = validateAndSanitizeDomain(val);
  if (!check.valid || !check.domain) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: check.error || 'Please provide a valid website URL or domain',
    });
  }
}).transform((val) => {
  const check = validateAndSanitizeDomain(val);
  return check.domain!;
});

/**
 * Schema for /api/check/public
 */
export const PublicCheckSchema = z.object({
  url: DomainSchema,
  domain: z.string().optional(),
  guestSessionId: z.string().max(100).optional(),
  isGuest: z.boolean().optional(),
}).transform((data) => {
  return {
    ...data,
    url: data.url,
  };
});

const CompetitorItemSchema = z.union([
  z.string().superRefine((val, ctx) => {
    const check = validateAndSanitizeDomain(val);
    if (!check.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: check.error || 'Invalid competitor domain',
      });
    }
  }).transform((c) => {
    const check = validateAndSanitizeDomain(c);
    return { name: check.domain || c, domain: check.domain || c };
  }),
  z.object({
    name: z.string().min(1).max(100),
    domain: z.string().min(1).max(253).superRefine((val, ctx) => {
      const check = validateAndSanitizeDomain(val);
      if (!check.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.error || 'Invalid competitor domain',
        });
      }
    }).transform((d) => {
      const check = validateAndSanitizeDomain(d);
      return check.domain || d;
    }),
  }),
]);

/**
 * Schema for /api/check/full
 */
export const FullCheckSchema = z.object({
  url: DomainSchema,
  domain: z.string().optional(),
  guestSessionId: z.string().max(100).optional(),
  isGuest: z.boolean().optional(),
  mode: z.string().optional(),
  customPrompts: z.array(
    z.string().min(1).max(200).transform((p) => sanitizePromptInput(p, 150))
  ).max(5).optional(),
  customCompetitors: z.array(CompetitorItemSchema).max(5).optional(),
});

/**
 * Schema for /api/brief/save
 */
export const SaveBriefSchema = z.object({
  id: z.string().max(100).nullable().optional(),
  run_id: z.string().max(100).nullable().optional(),
  gap_id: z.string().max(100).nullable().optional(),
  publisher_id: z.string().max(100).nullable().optional(),
  publisher_domain: z.string().min(1, 'Target domain and publisher are required.').max(253),
  target_domain: z.string().min(1, 'Target domain and publisher are required.').max(253),
  brief_data: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.string().max(50).nullable().optional(),
}).passthrough();

/**
 * Schema for /api/runs?id=...
 */
export const RunIdParamSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Run ID must contain only alphanumeric characters, dashes, or underscores'),
});
