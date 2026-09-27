import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdsyHeader from './AdsyHeader';

describe('AdsyHeader', () => {
  it('renders the Adsy logo and AI Visibility badge in guest mode', () => {
    render(<AdsyHeader userMode="guest" />);
    expect(screen.getByText('AI Visibility')).toBeTruthy();
    expect(screen.getByText('Guest Session')).toBeTruthy();
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('renders Adsy Account Connected in marketer mode and supports toggling', () => {
    const onToggle = vi.fn();
    render(<AdsyHeader userMode="marketer" onToggleUserMode={onToggle} />);
    expect(screen.getByText('Adsy Account Connected')).toBeTruthy();

    const guestBtn = screen.getByRole('button', { name: /Guest \(Public\)/i });
    fireEvent.click(guestBtn);
    expect(onToggle).toHaveBeenCalledWith('guest');
  });
});
