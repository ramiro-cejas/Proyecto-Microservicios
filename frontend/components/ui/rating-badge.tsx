import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  const ratingColor = rating >= 75 
    ? "bg-green-500" 
    : rating >= 60 
    ? "bg-yellow-500" 
    : "bg-red-500";

  return (
    <div 
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-background shadow-lg",
        ratingColor,
        className
      )}
    >
      {rating}
    </div>
  );
}