export default function StarRating({ rating, onRatingChange, readonly = false, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };
  const starSize = sizes[size] || sizes.md;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i;
    const half = !filled && rating >= i - 0.5;
    stars.push({ filled, half, value: i });
  }

  const handleClick = (value, e) => {
    if (readonly || !onRatingChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeft = x < rect.width / 2;
    onRatingChange(isLeft ? value - 0.5 : value);
  };

  const path = "M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z";

  return (
    <div className="flex items-center">
      {stars.map(({ filled, half, value }) => {
        const showFilled = filled || half;
        return (
          <button
            key={value}
            type="button"
            onClick={(e) => handleClick(value, e)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none flex items-center justify-center ${starSize} min-w-0 min-h-0 p-0 m-0 leading-none`}
            disabled={readonly}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
          >
            <svg className={`block ${starSize} ${showFilled ? 'text-gold' : 'text-text-soft/30'}`} viewBox="0 0 20 20" fill={showFilled ? 'currentColor' : 'none'} stroke={showFilled ? 'none' : 'currentColor'} strokeWidth="1.5" style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}>
              <path d={path} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
