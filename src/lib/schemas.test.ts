import { describe, it, expect } from 'vitest';
import { 
  PublicCheckSchema, 
  FullCheckSchema, 
  SaveBriefSchema, 
  RunIdParamSchema 
} from './schemas';

describe('Zod API Schemas Validation', () => {
  describe('PublicCheckSchema', () => {
    it('accepts valid domain input', () => {
      const res = PublicCheckSchema.safeParse({ url: 'https://business2community.com' });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.url).toBe('business2community.com');
      }
    });

    it('rejects invalid or SSRF domains', () => {
      const res = PublicCheckSchema.safeParse({ url: '127.0.0.1' });
      expect(res.success).toBe(false);
    });

    it('rejects missing or empty url', () => {
      const res = PublicCheckSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe('FullCheckSchema', () => {
    it('accepts valid custom prompts and competitors', () => {
      const res = FullCheckSchema.safeParse({
        url: 'forbes.com',
        customPrompts: ['What is modern AI visibility?', 'Best PR tools in 2026'],
        customCompetitors: ['techcrunch.com', 'venturebeat.com'],
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.customPrompts).toHaveLength(2);
      }
    });

    it('rejects too many custom prompts (> 5)', () => {
      const res = FullCheckSchema.safeParse({
        url: 'forbes.com',
        customPrompts: ['1', '2', '3', '4', '5', '6'],
      });
      expect(res.success).toBe(false);
    });

    it('sanitizes and truncates excessively long custom prompts', () => {
      const res = FullCheckSchema.safeParse({
        url: 'forbes.com',
        customPrompts: ['A'.repeat(500)],
      });
      expect(res.success).toBe(false);
    });
  });

  describe('SaveBriefSchema', () => {
    it('validates required fields for brief', () => {
      const res = SaveBriefSchema.safeParse({
        target_domain: 'whitepress.com',
        publisher_domain: 'forbes.com',
      });
      expect(res.success).toBe(true);
    });

    it('rejects brief without required domains', () => {
      const res = SaveBriefSchema.safeParse({
        publisher_domain: 'forbes.com',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('RunIdParamSchema', () => {
    it('accepts valid UUID', () => {
      const res = RunIdParamSchema.safeParse({
        id: '65f28798-b15e-4d2a-b9fc-d84e7033de3b',
      });
      expect(res.success).toBe(true);
    });

    it('rejects non-UUID strings (SQL injection / path traversal vectors)', () => {
      const res = RunIdParamSchema.safeParse({
        id: "1' OR '1'='1",
      });
      expect(res.success).toBe(false);
    });
  });
});
