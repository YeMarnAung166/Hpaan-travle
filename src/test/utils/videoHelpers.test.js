import { describe, it, expect } from 'vitest';
import { getYouTubeEmbedUrl } from '../../utils/videoHelpers';

describe('getYouTubeEmbedUrl', () => {
  it('returns null for empty input', () => {
    expect(getYouTubeEmbedUrl(null)).toBeNull();
    expect(getYouTubeEmbedUrl('')).toBeNull();
  });

  it('converts youtube.com/watch URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  });

  it('converts youtu.be URLs', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  });

  it('returns embed URLs as-is', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe(url);
  });

  it('returns null for invalid URLs', () => {
    expect(getYouTubeEmbedUrl('not-a-url')).toBeNull();
    expect(getYouTubeEmbedUrl('https://example.com')).toBeNull();
  });

  it('strips extra query params from watch URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s';
    expect(getYouTubeEmbedUrl(url)).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  });
});
