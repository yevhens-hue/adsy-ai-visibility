'use client';

import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { VerifiedPublisher } from './PublisherInventoryTable';

interface PlacementBriefModalProps {
  publisher: VerifiedPublisher;
  gapTopic: string;
  brandName: string;
  onClose: () => void;
}

export default function PlacementBriefModal({
  publisher,
  gapTopic,
  brandName,
  onClose,
}: PlacementBriefModalProps) {
  const [copied, setCopied] = useState(false);
  const [briefText, setBriefText] = useState(
`PLACEMENT RECOMMENDATIONS & BRIEF FOR ADSY TASK
Target Publisher: ${publisher.domain}
Client Brand: ${brandName}
Target Gap: ${gapTopic}

1. CONTENT OBJECTIVE & ANGLE:
Create an authoritative comparison and workflow analysis demonstrating how ${brandName} addresses market efficiency and team collaboration compared to standard category alternatives.

2. TARGET AI PROMPTS TO COVER:
- What are the best platforms for ${brandName} workflows in 2026?
- How does ${brandName} compare to top industry solutions?
- Key alternatives and pricing ROI benchmarks.

3. MANDATORY ENTITIES & REFERENCES:
- Cite authoritative third-party reviews and comparison benchmarks.
- Natural anchor placement linking to the target solution page.
- Focus on practical use-cases and verified performance metrics.`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(17, 44, 62, 0.65)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 100,
        padding: '20px'
      }}
    >
      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: '12px', 
          width: '100%', 
          maxWidth: '680px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid var(--adsy-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC'
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--adsy-text-dark)' }}>
              Article Recommendations for Adsy Order
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)' }}>
              Publisher: <strong>{publisher.domain}</strong> (DR {publisher.dr}, Price ${publisher.pricePlacement})
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '14px', display: 'flex', gap: '8px' }}>
            <span className="badge-adsy-pill badge-ai-purple">
              Gap: {gapTopic}
            </span>
            <span className="badge-adsy-pill badge-ai-green">
              <ShieldCheck size={11} /> Verified Publisher
            </span>
          </div>

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--adsy-text-secondary)' }}>
            Editable Content Brief (Automatically transferred to Task requirements):
          </label>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--adsy-border)',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#1E293B',
              background: '#F8FAFC',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Footer */}
        <div 
          style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid var(--adsy-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF'
          }}
        >
          <button 
            onClick={handleCopy}
            className="btn-adsy-outline"
          >
            {copied ? <Check size={14} color="#0E810C" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard' : 'Copy Brief'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="btn-adsy-outline">
              Close
            </button>
            <a 
              href={`https://cp.adsy.com/marketer/choose-product?site=${publisher.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-adsy-green"
            >
              Continue to Adsy Order <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
