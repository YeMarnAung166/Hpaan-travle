import '@testing-library/jest-dom/vitest';

// Mock IntersectionObserver for Framer Motion's whileInView
class MockIntersectionObserver {
  constructor(fn) { this.fn = fn; }
  observe() { this.fn([{ isIntersecting: true }]); }
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock matchMedia for framer-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
