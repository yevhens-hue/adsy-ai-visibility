export interface AdsyCatalogEntry {
  id: string;
  domain: string;
  basePrice: number | null;
  category: string;
  dr: number;
  da: number;
  traffic: string;
  completionRate: string;
  niches: string[];
}

export const KNOWN_ADSY_CATALOG: Record<string, AdsyCatalogEntry> = {
  // Marketing, SEO, Content & Influencer PR
  'business2community.com': { 
    id: '18368', 
    domain: 'business2community.com', 
    basePrice: 2386.33, 
    category: 'Marketing, B2B & Digital Strategy',
    dr: 84,
    da: 76,
    traffic: '720,000',
    completionRate: '94%',
    niches: ['marketing', 'seo', 'influencer', 'digital pr', 'content', 'social media', 'b2b']
  },
  'searchenginejournal.com': { 
    id: '146186', 
    domain: 'searchenginejournal.com', 
    basePrice: 689.97, 
    category: 'SEO, Search Authority & Organic Growth',
    dr: 89,
    da: 82,
    traffic: '1,850,000',
    completionRate: '96%',
    niches: ['seo', 'search', 'google', 'marketing', 'content', 'digital pr', 'traffic']
  },
  'hubspot.com': {
    id: '99843',
    domain: 'hubspot.com',
    basePrice: 1450.00,
    category: 'Inbound Marketing, Sales & CRM',
    dr: 93,
    da: 91,
    traffic: '18,500,000',
    completionRate: '95%',
    niches: ['marketing', 'crm', 'sales', 'content', 'inbound', 'email']
  },
  'contentmarketinginstitute.com': { 
    id: 'pub-107', 
    domain: 'contentmarketinginstitute.com', 
    basePrice: 580.00, 
    category: 'Content Marketing & Brand Storytelling',
    dr: 85,
    da: 77,
    traffic: '380,000',
    completionRate: '97%',
    niches: ['content', 'editorial', 'storytelling', 'marketing', 'brand']
  },
  'neilpatel.com': {
    id: 'pub-np-01',
    domain: 'neilpatel.com',
    basePrice: null, // Earned PR / Outreach
    category: 'Digital Marketing & Growth Hacking',
    dr: 91,
    da: 81,
    traffic: '563,000',
    completionRate: '98%',
    niches: ['marketing', 'seo', 'influencer', 'growth', 'traffic']
  },
  'backlinko.com': {
    id: 'pub-bl-01',
    domain: 'backlinko.com',
    basePrice: null, // Earned PR
    category: 'SEO Strategy & Link Acquisition',
    dr: 90,
    da: 80,
    traffic: '420,000',
    completionRate: '98%',
    niches: ['seo', 'link building', 'backlinks', 'search', 'marketing']
  },
  'semrush.com': {
    id: 'pub-sr-01',
    domain: 'semrush.com',
    basePrice: null, // Earned PR
    category: 'Search Intelligence & Competitive Insights',
    dr: 92,
    da: 85,
    traffic: '12,400,000',
    completionRate: '99%',
    niches: ['seo', 'competitor analysis', 'search', 'ppc', 'marketing']
  },

  // Technology, AI, Software & Computing
  'techbullion.com': { 
    id: '13278', 
    domain: 'techbullion.com', 
    basePrice: 73.80, 
    category: 'Technology, Business & Emerging Fintech',
    dr: 79,
    da: 68,
    traffic: '320,000',
    completionRate: '98%',
    niches: ['technology', 'tech', 'fintech', 'ai', 'finance', 'business', 'startups']
  },
  'venturebeat.com': { 
    id: '97966', 
    domain: 'venturebeat.com', 
    basePrice: 1529.18, 
    category: 'Enterprise AI, Gaming & Future Tech',
    dr: 91,
    da: 86,
    traffic: '2,400,000',
    completionRate: '95%',
    niches: ['ai', 'tech', 'enterprise', 'gaming', 'cloud', 'software', 'machine learning']
  },
  'techtimes.com': { 
    id: '14493', 
    domain: 'techtimes.com', 
    basePrice: 1079.96, 
    category: 'Consumer Electronics, Science & Trends',
    dr: 76,
    da: 62,
    traffic: '410,000',
    completionRate: '97%',
    niches: ['tech', 'science', 'gadgets', 'consumer', 'innovation']
  },
  'metapress.com': { 
    id: '55774', 
    domain: 'metapress.com', 
    basePrice: 49.50, 
    category: 'Tech, Web Publishing & Computing',
    dr: 75,
    da: 60,
    traffic: '280,000',
    completionRate: '97%',
    niches: ['tech', 'web', 'computing', 'publishing', 'software']
  },
  'programminginsider.com': { 
    id: '56240', 
    domain: 'programminginsider.com', 
    basePrice: 55.43, 
    category: 'Media, Broadcasting & Entertainment Tech',
    dr: 72,
    da: 58,
    traffic: '210,000',
    completionRate: '96%',
    niches: ['media', 'tv', 'broadcasting', 'entertainment', 'tech']
  },
  'techcrunch.com': {
    id: 'pub-tc-01',
    domain: 'techcrunch.com',
    basePrice: null, // Earned PR
    category: 'Venture Capital, Startups & Silicon Valley',
    dr: 92,
    da: 82,
    traffic: '668,000',
    completionRate: '98%',
    niches: ['startups', 'venture capital', 'tech', 'saas', 'funding']
  },

  // Real Estate, Architecture, Home & Design
  'urbansplatter.com': { 
    id: '50706', 
    domain: 'urbansplatter.com', 
    basePrice: 68.00, 
    category: 'Architecture, Luxury Homes & Real Estate',
    dr: 78,
    da: 64,
    traffic: '190,000',
    completionRate: '97%',
    niches: ['real estate', 'architecture', 'home', 'construction', 'design', 'lifestyle']
  },
  'zillow.com': { 
    id: '150653', 
    domain: 'zillow.com', 
    basePrice: 93.00, 
    category: 'Real Estate Marketplace & Housing Economics',
    dr: 92,
    da: 88,
    traffic: '42,000,000',
    completionRate: '95%',
    niches: ['real estate', 'housing', 'mortgage', 'property', 'investing']
  },

  // Lifestyle, Health, Family & Wellness
  'livepositively.com': { 
    id: '120758', 
    domain: 'livepositively.com', 
    basePrice: 51.00, 
    category: 'Health, Wellness, Self-Care & Motivation',
    dr: 74,
    da: 59,
    traffic: '165,000',
    completionRate: '97%',
    niches: ['health', 'wellness', 'lifestyle', 'fitness', 'mental health', 'self care']
  },
  'anationofmoms.com': { 
    id: '9773', 
    domain: 'anationofmoms.com', 
    basePrice: 37.50, 
    category: 'Parenting, Family, Home Life & Cooking',
    dr: 71,
    da: 55,
    traffic: '135,000',
    completionRate: '98%',
    niches: ['family', 'parenting', 'home', 'moms', 'kids', 'lifestyle']
  },
  'elevatedmagazines.com': { 
    id: '93053', 
    domain: 'elevatedmagazines.com', 
    basePrice: 37.50, 
    category: 'Luxury Lifestyle, Travel & Modern Culture',
    dr: 70,
    da: 54,
    traffic: '110,000',
    completionRate: '97%',
    niches: ['luxury', 'travel', 'fashion', 'lifestyle', 'culture']
  },
  '2amagazine.com': { 
    id: '380227', 
    domain: '2amagazine.com', 
    basePrice: 40.00, 
    category: 'Contemporary Arts, Design & Urban Culture',
    dr: 69,
    da: 53,
    traffic: '95,000',
    completionRate: '96%',
    niches: ['arts', 'culture', 'design', 'urban', 'lifestyle']
  },

  // Business, Leadership, Finance & General News
  'forbes.com': { 
    id: '60417', 
    domain: 'forbes.com', 
    basePrice: 1250.00, 
    category: 'Global Business, Leadership & Innovation',
    dr: 94,
    da: 92,
    traffic: '32,000,000',
    completionRate: '92%',
    niches: ['business', 'leadership', 'finance', 'investing', 'billionaires', 'tech', 'enterprise']
  },
  'thestartupmag.com': { 
    id: '13132', 
    domain: 'thestartupmag.com', 
    basePrice: 79.50, 
    category: 'Startups, Entrepreneurship & Small Business',
    dr: 76,
    da: 61,
    traffic: '220,000',
    completionRate: '96%',
    niches: ['startups', 'entrepreneurship', 'small business', 'management', 'business']
  },
  'financebuzz.com': { 
    id: 'pub-103', 
    domain: 'financebuzz.com', 
    basePrice: 240.00, 
    category: 'Personal Finance, Banking & Credit Solutions',
    dr: 78,
    da: 65,
    traffic: '520,000',
    completionRate: '97%',
    niches: ['finance', 'credit', 'banking', 'budgeting', 'investing', 'money']
  },
  'msn.com': { 
    id: '86010', 
    domain: 'msn.com', 
    basePrice: 239.99, 
    category: 'Global News Syndication & National Trends',
    dr: 93,
    da: 90,
    traffic: '48,000,000',
    completionRate: '96%',
    niches: ['news', 'general', 'syndication', 'media', 'world']
  },
  'ipsnews.net': { 
    id: '51869', 
    domain: 'ipsnews.net', 
    basePrice: 49.00, 
    category: 'International Journalism & Global Affairs',
    dr: 77,
    da: 63,
    traffic: '310,000',
    completionRate: '96%',
    niches: ['news', 'global', 'affairs', 'international', 'policy']
  },
  'bignewsnetwork.com': { 
    id: '51871', 
    domain: 'bignewsnetwork.com', 
    basePrice: 37.58, 
    category: 'Global News Wire & Regional Syndication',
    dr: 75,
    da: 62,
    traffic: '240,000',
    completionRate: '97%',
    niches: ['news', 'wire', 'syndication', 'regional', 'press']
  }
};

/**
 * Returns genuine editorial category for any domain, never synthetic "[Brand] AI Citations"
 */
export function getPublisherCategory(domain: string): string {
  const clean = (domain || '').toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').trim();
  const known = KNOWN_ADSY_CATALOG[clean];
  if (known?.category) {
    return known.category;
  }
  
  if (clean.includes('tech') || clean.includes('dev') || clean.includes('code') || clean.includes('cyber') || clean.includes('software')) {
    return 'Technology & Software Systems';
  }
  if (clean.includes('market') || clean.includes('seo') || clean.includes('search') || clean.includes('ad') || clean.includes('pr')) {
    return 'Digital Marketing & SEO Media';
  }
  if (clean.includes('finance') || clean.includes('money') || clean.includes('invest') || clean.includes('crypto') || clean.includes('bank')) {
    return 'Finance & Capital Markets';
  }
  if (clean.includes('home') || clean.includes('estate') || clean.includes('realty') || clean.includes('house') || clean.includes('arch')) {
    return 'Real Estate & Architectural Design';
  }
  if (clean.includes('health') || clean.includes('fit') || clean.includes('life') || clean.includes('mom') || clean.includes('wellness')) {
    return 'Health, Wellness & Lifestyle';
  }
  if (clean.includes('news') || clean.includes('press') || clean.includes('post') || clean.includes('daily') || clean.includes('times')) {
    return 'News, Media & Editorial Wire';
  }
  return 'Enterprise Business & Strategy';
}

/**
 * Helper to retrieve catalog publishers matching specific niche or keywords
 */
export function findPublishersByNiche(keywords: string[]): AdsyCatalogEntry[] {
  const normKeywords = keywords.map(k => k.toLowerCase().trim()).filter(Boolean);
  if (normKeywords.length === 0) return Object.values(KNOWN_ADSY_CATALOG);

  return Object.values(KNOWN_ADSY_CATALOG).filter(entry => {
    return entry.niches.some(n => normKeywords.some(k => n.includes(k) || k.includes(n))) ||
           normKeywords.some(k => entry.category.toLowerCase().includes(k));
  });
}
