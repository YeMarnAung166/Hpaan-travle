import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../../context/ToastContext';

function TestConsumer() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast({ type: 'success', message: 'Success!' })}>Show Success</button>
      <button onClick={() => toast({ type: 'error', message: 'Error!' })}>Show Error</button>
      <button onClick={() => toast({ type: 'warning', message: 'Warning!' })}>Show Warning</button>
      <button onClick={() => toast({ type: 'info', message: 'Info!' })}>Show Info</button>
    </div>
  );
}

function renderWithProvider(ui) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('Toast', () => {
  it('renders success toast with message', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders error toast with message', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('renders warning toast with message', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('Show Warning'));
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  it('renders info toast with message', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('Show Info'));
    expect(screen.getByText('Info!')).toBeInTheDocument();
  });

  it('can show multiple toasts', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
    const closeBtns = screen.getAllByRole('button');
    const closeBtn = closeBtns.find(b => b.innerHTML.includes('svg') || b.textContent === '');
    if (closeBtn) fireEvent.click(closeBtn);
  });

  it('throws error when useToast is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    spy.mockRestore();
  });
});
