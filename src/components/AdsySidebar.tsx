'use client';

import React from 'react';
import { 
  Sparkles, 
  BarChart3, 
  ShieldCheck
} from 'lucide-react';

interface AdsySidebarProps {
  currentTab: 'checker' | 'inventory' | 'reports';
  onSelectTab: (tab: 'checker' | 'inventory' | 'reports') => void;
}

export default function AdsySidebar({ currentTab, onSelectTab }: AdsySidebarProps) {
  return (
    <aside className="cp-sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div className="cp-nav-category">AI Visibility Tools</div>
        
        <button 
          onClick={() => onSelectTab('checker')}
          className={`cp-nav-item ${currentTab === 'checker' ? 'active' : ''}`}
        >
          <Sparkles size={18} color={currentTab === 'checker' ? '#3E4FEA' : '#64748B'} />
          <span style={{ flex: 1 }}>AI Visibility Check</span>
          <span className="badge-adsy-pill badge-ai-purple" style={{ fontSize: '9px' }}>NEW</span>
        </button>

        <button 
          onClick={() => onSelectTab('inventory')}
          className={`cp-nav-item ${currentTab === 'inventory' ? 'active' : ''}`}
        >
          <ShieldCheck size={18} color={currentTab === 'inventory' ? '#3E4FEA' : '#64748B'} />
          <span style={{ flex: 1 }}>AI Inventory & Gaps</span>
          <span className="badge-adsy-pill badge-ai-green" style={{ fontSize: '9px' }}>LIVE</span>
        </button>

        <button 
          onClick={() => onSelectTab('reports')}
          className={`cp-nav-item ${currentTab === 'reports' ? 'active' : ''}`}
        >
          <BarChart3 size={18} color={currentTab === 'reports' ? '#3E4FEA' : '#64748B'} />
          <span>Saved Reports</span>
        </button>
      </nav>
    </aside>
  );
}
