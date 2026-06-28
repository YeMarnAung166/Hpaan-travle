import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../components/ui/Pagination';

describe('Pagination', () => {
  it('renders page numbers', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    const currentBtn = screen.getByText('3');
    expect(currentBtn.className).toContain('bg-primary');
  });

  it('calls onPageChange with correct page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables prev button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    const prevBtn = screen.getByLabelText(/previous/i);
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    const nextBtn = screen.getByLabelText(/next/i);
    expect(nextBtn).toBeDisabled();
  });

  it('shows ellipsis for many pages', () => {
    render(<Pagination page={5} totalPages={20} onPageChange={() => {}} />);
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe('');
  });
});
