import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdsySidebar from './AdsySidebar';

describe('AdsySidebar', () => {
  it('highlights the active tab and calls onSelectTab', () => {
    const onSelectTab = vi.fn();
    render(<AdsySidebar currentTab="checker" onSelectTab={onSelectTab} />);
    expect(screen.getByText('AI Visibility Check')).toBeTruthy();
    expect(screen.getByText('NEW')).toBeTruthy();

    const inventoryButton = screen.getByText('AI Inventory & Gaps').closest('button')!;
    fireEvent.click(inventoryButton);
    expect(onSelectTab).toHaveBeenCalledWith('inventory');
  });
});
