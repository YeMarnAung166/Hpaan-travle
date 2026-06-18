/**
 * Convert a YouTube URL to an embed URL
 * Supports: youtube.com/watch?v=... , youtu.be/... , youtube.com/embed/...
 */
export function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  // If it's already an embed URL, return as-is
  if (url.includes('/embed/')) return url;

  // Extract video ID
  let videoId = null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }
  if (!videoId) return null;

  // Return embed URL with autoplay disabled, modest branding
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}