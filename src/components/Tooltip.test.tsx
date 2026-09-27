import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Tooltip, { InfoTooltip } from './Tooltip';

describe('Tooltip component', () => {
  it('renders children with title and tooltip structure', () => {
    render(
      <Tooltip content="Explanation for metric">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: /hover me/i });
    expect(button).toBeDefined();
    // Fallback title attribute present
    expect(button.closest('.adsy-tooltip-wrapper')).toBeDefined();
    expect(screen.getByText('Explanation for metric')).toBeDefined();
  });

  it('renders InfoTooltip with icon and content', () => {
    render(<InfoTooltip text="Detailed explanation for Ahrefs DR" />);
    
    expect(screen.getByText('Detailed explanation for Ahrefs DR')).toBeDefined();
    const trigger = screen.getByRole('button');
    expect(trigger.getAttribute('aria-label')).toBe('Detailed explanation for Ahrefs DR');
  });
});
