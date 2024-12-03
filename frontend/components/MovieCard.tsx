"use client";

import { Movie } from "@/app/types/movie";
import { Card } from "@/components/ui/card";
import { add, format } from "date-fns";
import Image from "next/image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { useEffect, useState } from "react";
import { MovieDialog } from "./movie-dialog";
import { usePathname } from "next/navigation";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [currentDomain, setCurrentDomain] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleGetDomain = () => {
    setCurrentDomain(window.location.origin);
  };
  useEffect(() => {
    handleGetDomain();
  }, []);

  const pathName = usePathname();
  console.log(pathName);
  const HISTORYSERVICE_URL = `${currentDomain.slice(0, -5)}:3004/history`;

  const rating = Math.round(movie.vote_average * 10);
  let formattedDate = "";
  if (movie.release_date !== "") {
    formattedDate = format(new Date(movie.release_date), "d MMM yyyy");
  }

  // Add movie to history via post with movie id and timestamp in the body
  const addToHistory = async (movieId: string) => {
    try {
      const response = await fetch(HISTORYSERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          userId: 123,
          watchedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add movie to history");
      }
    } catch (error) {
      console.error("Error adding movie to history:", error);
    }
  };

  const handleClick = () => {
    addToHistory(movie._id);
    setShowDialog(true);
  };
  return (
    <>
      <Card
        className="group relative overflow-hidden rounded-lg transition-all hover:scale-[1.02] hover:cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute -bottom-5 left-4">
            <RatingBadge rating={rating} />
          </div>
        </div>
        <div className="p-4 pt-8">
          <h3 className="font-semibold leading-none tracking-tight">
            {movie.title}
          </h3>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </Card>

      <MovieDialog
        movie={movie}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
