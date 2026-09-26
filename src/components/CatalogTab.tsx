'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import PublisherInventoryTable, { VerifiedPublisher } from './PublisherInventoryTable';

export interface CatalogTabProps {
  selectedGap?: string;
  onClearGap: () => void;
  publishersList?: VerifiedPublisher[];
  highlightedDomain: string | null;
  currentDomain?: string;
  onBackToReport: () => void;
  onOpenBriefModal: (pub: VerifiedPublisher) => void;
}

export default function CatalogTab({
  selectedGap,
  onClearGap,
  publishersList,
  highlightedDomain,
  currentDomain,
  onBackToReport,
  onOpenBriefModal,
}: CatalogTabProps) {
  return (
    <div>
      {/* Selected Gap Context Banner */}
      {selectedGap && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--adsy-blue)" />
            <div>
              <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: 700 }}>
                Active Media Strategy Filter:
              </span>
              <strong style={{ fontSize: '13px', color: '#1E3A8A', display: 'block' }}>
                {selectedGap}
              </strong>
            </div>
          </div>
          <button 
            onClick={onClearGap}
            className="btn-adsy-outline"
            style={{ fontSize: '11px', padding: '4px 10px', background: '#FFFFFF' }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Publisher Inventory Table matching cp.adsy.com/marketer/platform */}
      <PublisherInventoryTable 
        selectedGapTopic={selectedGap}
        publishersList={publishersList}
        highlightedDomain={highlightedDomain}
        currentDomain={currentDomain}
        onBackToReport={onBackToReport}
        onOpenBriefModal={onOpenBriefModal}
      />
    </div>
  );
}
