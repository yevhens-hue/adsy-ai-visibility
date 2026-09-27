'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
  maxWidth?: number | string;
}

export default function Tooltip({
  content,
  position = 'top',
  children,
  inline = false,
  className = '',
  maxWidth = 260
}: TooltipProps) {
  if (!content) return <>{children}</>;

  const contentText = typeof content === 'string' ? content : undefined;

  return (
    <span
      className={`adsy-tooltip-wrapper ${inline ? 'adsy-tooltip-inline' : ''} ${className}`}
      title={contentText}
      style={{ display: inline ? 'inline-flex' : 'inline-block', position: 'relative' }}
    >
      {children}
      <span 
        className={`adsy-tooltip-bubble adsy-tooltip-${position}`}
        role="tooltip"
        style={{ maxWidth }}
      >
        {content}
        <span className="adsy-tooltip-arrow" />
      </span>
    </span>
  );
}

export interface InfoTooltipProps {
  text: string;
  size?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function InfoTooltip({
  text,
  size = 13,
  position = 'top',
  className = ''
}: InfoTooltipProps) {
  return (
    <Tooltip content={text} position={position} inline className={className}>
      <button
        type="button"
        className="adsy-info-icon-trigger"
        aria-label={text}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'transparent',
          padding: '0 2px',
          margin: 0,
          cursor: 'help',
          color: '#64748B',
          lineHeight: 1,
          verticalAlign: 'middle',
          transition: 'color 0.15s ease'
        }}
      >
        <HelpCircle size={size} />
      </button>
    </Tooltip>
  );
}
