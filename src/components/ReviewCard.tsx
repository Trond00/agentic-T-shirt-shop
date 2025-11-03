import { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">{renderStars(review.rating)}</div>
        <span className="text-sm text-gray-600">
          {review.customer_email ? review.customer_email.split('@')[0] : 'Anonymous'}
        </span>
        <span className="text-sm text-gray-500">•</span>
        <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
      </div>
      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
