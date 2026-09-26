'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  CheckCircle, 
  ListOrdered, 
  FolderGit2, 
  CreditCard, 
  BarChart3, 
  Settings,
  HelpCircle,
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
        <div className="cp-nav-category">AI Intelligence</div>
        
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

        <div className="cp-nav-category">Marketplace Navigation</div>

        <a 
          href="https://cp.adsy.com/marketer/platform?SiteSearch%5Bverified%5D=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cp-nav-item"
        >
          <Search size={18} color="#64748B" />
          <span>Search for Sites</span>
        </a>

        <a 
          href="https://cp.adsy.com/marketer/task" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cp-nav-item"
        >
          <ListOrdered size={18} color="#64748B" />
          <span>My Tasks & Orders</span>
        </a>

        <a 
          href="https://cp.adsy.com/marketer/project" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cp-nav-item"
        >
          <FolderGit2 size={18} color="#64748B" />
          <span>Projects & Domains</span>
        </a>

        <a 
          href="https://cp.adsy.com/marketer/balance" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cp-nav-item"
        >
          <CreditCard size={18} color="#64748B" />
          <span>Balance & Invoices</span>
        </a>

        <div className="cp-nav-category">Support & Help</div>

        <a 
          href="https://adsy.com/faq" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cp-nav-item"
        >
          <HelpCircle size={18} color="#64748B" />
          <span>Help & Guidelines</span>
        </a>
      </nav>

      {/* Account Info Footer */}
      <div 
        style={{ 
          borderTop: '1px solid var(--adsy-border)', 
          paddingTop: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}
      >
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: '#F1F5F9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#3E4FEA',
            fontWeight: 700,
            fontSize: '12px'
          }}
        >
          VIP
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--adsy-text-dark)' }}>Marketer Mode</div>
          <div style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>ID: 15537-VIP</div>
        </div>
      </div>
    </aside>
  );
}
