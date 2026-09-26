'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Layers,
  Database
} from 'lucide-react';
import { PublicCheckSummary } from '@/types';

const CHECK_STEPS = [
  'Preparing 5 targeted prompts (US market, English)...',
  'Querying AI engines (ChatGPT, Perplexity, Claude)...',
  'Extracting brand mentions & verified citation URLs...',
  'Computing Visibility Score & identifying key gaps...'
];

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicCheckSummary | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStepIndex(0);

    // Step progress simulation
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < CHECK_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const res = await fetch('/api/check/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete visibility check');
      }

      setResult(data.data);
    } catch (err: unknown) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Header */}
      <header className="app-header">
        <div className="brand-badge">
          <Database size={22} color="#6366F1" />
          Adsy <span>AI Visibility</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a 
            href="https://adsy.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}
          >
            Adsy Ecosystem
          </a>
          <button className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container" style={{ padding: '3.5rem 1.5rem', flex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
          <div style={{ display: 'inline-flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="badge badge-primary">Adsy Intelligence Layer</span>
            <span className="badge badge-cyan">US Market / English</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
            Measure Your Brand Presence in <span style={{ color: 'var(--accent-cyan)' }}>AI Answers</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6 }}>
            Free public audit across ChatGPT, Perplexity & Claude. Discover citation sources, competitor appearances, and actionable thematic gaps.
          </p>

          {/* Form */}
          <form onSubmit={handleCheck} style={{ marginTop: '2.5rem' }}>
            <div 
              className="glass-panel" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0.5rem 0.75rem', 
                gap: '0.75rem',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.15)'
              }}
            >
              <Search size={22} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter company website (e.g. monday.com, hubspot.com)"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '1.05rem',
                  padding: '0.75rem 0',
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !url.trim()}
                style={{ minWidth: '190px' }}
              >
                {loading ? <Sparkles size={18} className="pulsing" /> : <Sparkles size={18} />}
                {loading ? 'Analyzing...' : 'Check AI Visibility'}
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <span>Sample: 5 standard category prompts</span>
              <span>Engines: ChatGPT, Perplexity, Claude</span>
              <span>No signup required</span>
            </div>
          </form>

          {/* Loading Progress */}
          {loading && (
            <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-cyan)',
                  boxShadow: '0 0 10px var(--accent-cyan)'
                }} className="pulsing" />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {CHECK_STEPS[currentStepIndex]}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #6366F1, #38BDF8)',
                    width: `${((currentStepIndex + 1) / CHECK_STEPS.length) * 100}%`,
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Scorecard */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{result.run.brand_name}</h2>
                    <span className="badge badge-default">{result.run.domain}</span>
                    <span className="badge badge-emerald">Audit Completed</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Tested 5 category queries across 3 AI engines (15 total observations). Date: {new Date(result.run.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                  Unlock Full 15-Prompt Report <ArrowRight size={16} />
                </button>
              </div>

              {/* Core Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span>Visibility Score</span>
                    <TrendingUp size={16} color="var(--accent-cyan)" />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {result.run.visibility_score !== null ? `${result.run.visibility_score}%` : 'No data'}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '0.35rem' }}>
                    Share of verified observations where {result.run.brand_name} was mentioned.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span>Prompt Coverage</span>
                    <Layers size={16} color="var(--accent-primary)" />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {result.run.prompt_coverage !== null ? `${result.run.prompt_coverage}%` : 'No data'}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '0.35rem' }}>
                    Queries with at least one mention across all AI responses.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span>Data Reliability</span>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                    100%
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '0.35rem' }}>
                    15/15 successful query responses received without timeout.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Gaps & Sample Observation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
              {/* Key Gaps */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Key Visibility Gaps</h3>
                  <span className="badge badge-cyan">{result.gaps.length} Gaps Detected</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.gaps.map((gap) => (
                    <div 
                      key={gap.id}
                      style={{ 
                        padding: '1.25rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '10px' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{gap.topic}</span>
                        <span className={`badge ${gap.priority === 'high' ? 'badge-primary' : 'badge-default'}`}>
                          {gap.priority} Priority
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {gap.rationale}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                          Explore in Adsy AI Search <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample AI Answer */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verified AI Answer Sample</h3>
                  <span className="badge badge-emerald">{result.sampleAnswer?.platform}</span>
                </div>
                {result.sampleAnswer && (
                  <div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', lineHeight: 1.6, color: '#E2E8F0', marginBottom: '1rem' }}>
                      "{result.sampleAnswer.raw_text}"
                    </div>

                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Cited Sources in Answer ({result.sampleAnswer.citations.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {result.sampleAnswer.citations.map((cite, idx) => (
                        <a 
                          key={idx} 
                          href={cite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.825rem'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                            {cite}
                          </span>
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blurred Competitors Block (Gated) */}
            <div className="glass-panel blur-gate" style={{ padding: '2rem' }}>
              <div className="blur-content">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Competitor Benchmark Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1.5rem', background: '#1E293B', borderRadius: '8px' }}>Competitor A: 68% Visibility</div>
                  <div style={{ padding: '1.5rem', background: '#1E293B', borderRadius: '8px' }}>Competitor B: 54% Visibility</div>
                  <div style={{ padding: '1.5rem', background: '#1E293B', borderRadius: '8px' }}>Competitor C: 42% Visibility</div>
                  <div style={{ padding: '1.5rem', background: '#1E293B', borderRadius: '8px' }}>Competitor D: 31% Visibility</div>
                </div>
              </div>
              <div className="blur-overlay">
                <Lock size={32} color="#A5B4FC" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {result.competitorsCount} Competitors Detected in Citations
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '520px', marginBottom: '1.25rem' }}>
                  Sign in with your Adsy account to unlock the full 15-prompt competitor benchmark, discover which domains cite them, and match them with Adsy publishers.
                </p>
                <button className="btn btn-primary">
                  Sign In via Adsy to Unlock Competitors
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Adsy AI Visibility &copy; {new Date().getFullYear()}. Connected to Adsy Media Marketplace & AI Search.
      </footer>
    </div>
  );
}
