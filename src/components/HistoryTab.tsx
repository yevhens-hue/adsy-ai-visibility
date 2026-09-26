'use client';

import React from 'react';
import { GitCompare } from 'lucide-react';
import { CheckRun } from '@/types';

export interface HistoryTabProps {
  savedReports: { run: CheckRun }[];
  selectedForComparison: string[];
  onToggleCompareRun: (runId: string) => void;
  onTriggerComparison: () => void;
  onLoadSavedRun: (runId: string) => void;
}

export default function HistoryTab({
  savedReports,
  selectedForComparison,
  onToggleCompareRun,
  onTriggerComparison,
  onLoadSavedRun,
}: HistoryTabProps) {
  return (
    <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--adsy-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <strong style={{ fontSize: '14px', color: 'var(--adsy-text-dark)' }}>
            Historical AI Visibility Runs ({savedReports.length})
          </strong>
          <p style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)', margin: '2px 0 0' }}>
            Select any two runs to generate an automated Diff View (Visibility Score delta, newly gained & lost mentions).
          </p>
        </div>

        <button 
          onClick={onTriggerComparison}
          disabled={selectedForComparison.length !== 2}
          className="btn-adsy-blue"
          style={{ fontSize: '12px', padding: '6px 14px', opacity: selectedForComparison.length === 2 ? 1 : 0.5 }}
        >
          <GitCompare size={14} /> Compare 2 Selected Runs ({selectedForComparison.length}/2)
        </button>
      </div>

      <table className="table-adsy">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>Diff</th>
            <th>Date / Timestamp</th>
            <th>Domain</th>
            <th>Mode</th>
            <th>Visibility Score</th>
            <th>Prompt Coverage</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {savedReports.map(({ run }) => {
            const isChecked = selectedForComparison.includes(run.id);
            return (
              <tr key={run.id} style={{ background: isChecked ? '#EFF6FF' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleCompareRun(run.id)}
                  />
                </td>
                <td>
                  <strong>{new Date(run.created_at).toLocaleDateString()}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>
                    {new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td><strong>{run.domain}</strong></td>
                <td>
                  <span className="badge-adsy-pill" style={{ background: run.mode === 'full' ? '#EDE9FE' : '#F1F5F9', color: run.mode === 'full' ? '#6D28D9' : '#475569' }}>
                    {run.mode.toUpperCase()}
                  </span>
                </td>
                <td>
                  <strong style={{ color: 'var(--adsy-blue)' }}>{run.visibility_score}%</strong>
                </td>
                <td>
                  <strong>{run.prompt_coverage}%</strong>
                </td>
                <td>
                  <button 
                    onClick={() => onLoadSavedRun(run.id)}
                    className="btn-adsy-outline"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    Load Report
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
