const SUPABASE_STORAGE_PATTERN = /supabase\.co\/storage\/v1\/object\/public\//;

export function getOptimizedImage(url, width = 600, quality = 80) {
  if (!url) return null;
  if (SUPABASE_STORAGE_PATTERN.test(url)) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}&resize=cover`;
  }
  return url;
}

export const imgProps = (url, width) => ({
  src: getOptimizedImage(url, width),
  loading: 'lazy',
  decoding: 'async',
});
