import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing (1/5)',
  2: 'Fair (2/5)',
  3: 'Good (3/5)',
  4: 'Very Good (4/5)',
  5: 'Exceptional (5/5)',
};

export function StarRating({
  value,
  onChange,
  interactive = false,
  size = 'md',
  showLabel = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const activeRating = interactive && hoverRating !== null ? hoverRating : Math.round(value);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => interactive && setHoverRating(null)}
        role={interactive ? 'radiogroup' : undefined}
        aria-label={interactive ? 'Rate this product from 1 to 5 stars' : `Rating: ${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= activeRating;

          if (!interactive) {
            return (
              <Star
                key={starIndex}
                className={`${starSizes[size]} transition-colors ${
                  isFilled ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
                }`}
                aria-hidden="true"
              />
            );
          }

          return (
            <button
              key={starIndex}
              type="button"
              role="radio"
              aria-checked={value === starIndex}
              aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''} - ${RATING_LABELS[starIndex]}`}
              onMouseEnter={() => setHoverRating(starIndex)}
              onClick={() => onChange?.(starIndex)}
              className="p-0.5 text-stone-300 hover:scale-115 transition-transform duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm cursor-pointer"
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-stone-700 min-w-[120px]">
          {RATING_LABELS[activeRating] || `${value.toFixed(1)} / 5`}
        </span>
      )}
    </div>
  );
}
