import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdsyHeader from './AdsyHeader';

describe('AdsyHeader', () => {
  it('renders the Adsy logo and AI Visibility badge', () => {
    render(<AdsyHeader />);
    expect(screen.getByText('AI Visibility')).toBeTruthy();
    expect(screen.getByText('Adsy Account Connected')).toBeTruthy();
    expect(screen.getByRole('link')).toBeTruthy();
  });
});
