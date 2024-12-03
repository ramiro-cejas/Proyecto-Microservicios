"use client";

import { Movie } from "@/app/types/movie";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import Image from "next/image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Star, Users } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

interface MovieDialogProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDialog({ movie, open, onOpenChange }: MovieDialogProps) {
  const rating = Math.round(movie.vote_average * 10);

  let formattedDate = "";
  if (movie.release_date !== "") {
    formattedDate = format(new Date(movie.release_date), "d MMM yyyy");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden"></DialogTitle>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
        <div className="relative h-[300px] w-full">
          <Image
            src={`https://image.tmdb.org/t/p/w1066_and_h600_bestv2${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <p className="text-sm text-gray-300">{movie.original_title}</p>
            </div>
            <RatingBadge rating={rating} className="h-12 w-12 text-base" />
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{movie.vote_count} votes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">
                {movie.popularity.toFixed(0)} popularity
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-semibold">Overview</h3>
            <p className="text-sm text-muted-foreground">{movie.overview}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.adult && (
              <div className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-500">
                Adult Content
              </div>
            )}
            <div className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-500">
              {movie.original_language.toUpperCase()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
