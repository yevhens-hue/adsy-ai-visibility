'use client';

import React from 'react';
import { X, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RunComparisonDiff } from '@/types';

interface Props {
  diff: RunComparisonDiff;
  onClose: () => void;
}

export default function ReportComparisonModal({ diff, onClose }: Props) {
  const { run1, run2, visibilityScoreDelta, promptCoverageDelta, brandMentionShareDelta, newMentions, lostMentions } = diff;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--adsy-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--adsy-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--adsy-bg-panel)',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--adsy-text-dark)', margin: 0 }}>
              AI Visibility Runs Comparison (Diff View)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)', margin: '4px 0 0' }}>
              Comparing Run from {new Date(run1.created_at).toLocaleDateString()} with Run from {new Date(run2.created_at).toLocaleDateString()} for <strong>{run1.domain}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--adsy-text-secondary)',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Delta Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {/* Visibility Score Delta */}
            <div style={{ border: '1px solid var(--adsy-border)', borderRadius: '10px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)', fontWeight: 600 }}>Visibility Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                  {run1.visibility_score}% <ArrowRight size={14} style={{ display: 'inline', color: '#94A3B8' }} /> {run2.visibility_score}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '13px', fontWeight: 700, color: visibilityScoreDelta >= 0 ? '#16A34A' : '#DC2626' }}>
                {visibilityScoreDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{visibilityScoreDelta >= 0 ? `+${visibilityScoreDelta}%` : `${visibilityScoreDelta}%`} pts</span>
              </div>
            </div>

            {/* Prompt Coverage Delta */}
            <div style={{ border: '1px solid var(--adsy-border)', borderRadius: '10px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)', fontWeight: 600 }}>Prompt Coverage</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                  {run1.prompt_coverage}% <ArrowRight size={14} style={{ display: 'inline', color: '#94A3B8' }} /> {run2.prompt_coverage}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '13px', fontWeight: 700, color: promptCoverageDelta >= 0 ? '#16A34A' : '#DC2626' }}>
                {promptCoverageDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{promptCoverageDelta >= 0 ? `+${promptCoverageDelta}%` : `${promptCoverageDelta}%`} pts</span>
              </div>
            </div>

            {/* Brand Mention Share Delta */}
            <div style={{ border: '1px solid var(--adsy-border)', borderRadius: '10px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)', fontWeight: 600 }}>Brand Mention Share</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                  {run1.brand_mention_share || 0}% <ArrowRight size={14} style={{ display: 'inline', color: '#94A3B8' }} /> {run2.brand_mention_share || 0}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '13px', fontWeight: 700, color: (brandMentionShareDelta || 0) >= 0 ? '#16A34A' : '#DC2626' }}>
                {(brandMentionShareDelta || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{(brandMentionShareDelta || 0) >= 0 ? `+${brandMentionShareDelta || 0}%` : `${brandMentionShareDelta}%`} pts</span>
              </div>
            </div>
          </div>

          {/* New Mentions */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CheckCircle2 size={16} /> Newly Gained AI Mentions ({newMentions.length})
            </h4>
            {newMentions.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--adsy-text-dark)' }}>
                {newMentions.map((text, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{text}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--adsy-text-secondary)', margin: 0 }}>No new prompt mentions identified in this interval.</p>
            )}
          </div>

          {/* Lost Mentions */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <AlertTriangle size={16} /> Lost or Inactive Mentions ({lostMentions.length})
            </h4>
            {lostMentions.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--adsy-text-dark)' }}>
                {lostMentions.map((text, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{text}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--adsy-text-secondary)', margin: 0 }}>Zero lost mentions. Historical presence maintained across all checked queries.</p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={onClose}
              className="btn-adsy-outline"
              style={{ padding: '8px 20px', fontSize: '14px' }}
            >
              Close Diff View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
