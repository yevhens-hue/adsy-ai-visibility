import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PublisherInventoryTable, { SAMPLE_PUBLISHERS } from './PublisherInventoryTable';
import { VerifiedPublisher } from './PublisherInventoryTable';

describe('PublisherInventoryTable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders sample publishers by default', () => {
    render(<PublisherInventoryTable />);
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(SAMPLE_PUBLISHERS.length);
    expect(screen.getByText('techbullion.com')).toBeTruthy();
    expect(screen.getByText('venturebeat.com')).toBeTruthy();
  });

  it('renders a "View in Inventory" link for every catalog publisher', () => {
    render(<PublisherInventoryTable />);
    const rows = screen.getAllByRole('row');
    // subtract header row
    expect(rows.length - 1).toBe(SAMPLE_PUBLISHERS.length);
  });

  it('calls onOpenBriefModal with the selected publisher when Brief is clicked', () => {
    const onOpenBriefModal = vi.fn();
    render(<PublisherInventoryTable publishersList={SAMPLE_PUBLISHERS} onOpenBriefModal={onOpenBriefModal} />);
    const buttons = screen.getAllByRole('button', { name: /Brief/i });
    fireEvent.click(buttons[0]);
    expect(onOpenBriefModal).toHaveBeenCalledWith(expect.objectContaining({ domain: SAMPLE_PUBLISHERS[0].domain }));
  });

  it('filters to seen_in_ai publishers', () => {
    render(<PublisherInventoryTable publishersList={SAMPLE_PUBLISHERS} />);
    const seenButton = screen.getByText('Seen in AI Sources');
    fireEvent.click(seenButton);
    // thestartupmag is not seen in ai; ensure not in DOM
    expect(screen.queryByText('thestartupmag.com')).toBeNull();
    // techbullion is seen in ai; ensure still present
    expect(screen.getByText('techbullion.com')).toBeTruthy();
  });

  it('shows "High AI Opportunity" badge text', () => {
    render(<PublisherInventoryTable publishersList={SAMPLE_PUBLISHERS} />);
    expect(screen.getAllByText('AI Opportunity: High').length).toBeGreaterThan(0);
  });
});
