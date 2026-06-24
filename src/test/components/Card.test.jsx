import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../../components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default card styles', () => {
    const { container } = render(<Card>Default</Card>);
    const el = container.firstChild;
    expect(el).toHaveClass('rounded-xl');
  });

  it('applies glass class when glass prop is true', () => {
    const { container } = render(<Card glass>Glass card</Card>);
    expect(container.firstChild).toHaveClass('glass-card');
  });

  it('wraps children in padded div by default', () => {
    const { container } = render(<Card>Wrapped</Card>);
    const padded = container.querySelector('.p-5');
    expect(padded).toBeInTheDocument();
    expect(padded).toHaveTextContent('Wrapped');
  });

  it('skips padding wrapper when noPadding is true', () => {
    const { container } = render(<Card noPadding>No pad</Card>);
    expect(container.querySelector('.p-5')).toBeNull();
    expect(container.firstChild.textContent).toBe('No pad');
  });
});
