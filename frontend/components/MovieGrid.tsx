"use client";
import { MovieCard } from "./MovieCard";
import { useState, useEffect } from "react";
import { Movie } from "@/app/types/movie";

export default function MovieGrid() {
  const [currentDomain, setCurrentDomain] = useState("");
  const handleGetDomain = () => {
    setCurrentDomain(window.location.origin);
  };

  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    handleGetDomain();
  }, []);

  useEffect(() => {
    if (currentDomain) {
      fetchRandomMovies();
    }
  }, [currentDomain]); // Recalcula cuando currentDomain cambia


  const fetchRandomMovies = async () => {
    const RANDOM_MOVIES_URL = `${currentDomain.slice(0, -5)}:3002/api/random/20`;

    try {
      const response = await fetch(RANDOM_MOVIES_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch random movies");
      }
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching random movies:", error);
    }
  };

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Popular Movies</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  );
}
