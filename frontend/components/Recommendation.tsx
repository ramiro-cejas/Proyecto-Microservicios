"use client";
import { MovieCard } from "./MovieCard";
import { useState, useEffect } from "react";
import { Movie } from "@/app/types/movie";

export default function Recommendation() {
  const [currentDomain, setCurrentDomain] = useState("");
  const [recommendation, setRecommendation] = useState<Movie[]>([]);

  // Función para obtener el dominio
  const handleGetDomain = () => {
    setCurrentDomain(window.location.origin);
  };

  // Función para obtener las películas recomendadas
  const fetchRecommendedMovies = async () => {
    if (!currentDomain) return; // Asegúrate de que currentDomain esté configurado

    //eliminar los ultimos 4 caracteres de la url para que no haya conflicto con el puerto
    
    const RECOMMENDER_URL = `${currentDomain.slice(0, -5)}:3003/recommendations/123`;
    const MOVIES_SERVICE_URL = `${currentDomain.slice(0, -5)}:3001/api/movies`;

    try {
      console.log(RECOMMENDER_URL);
      const response = await fetch(RECOMMENDER_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await response.json();
      console.log(data.recommendedMovieIds);

      for (let i = 0; i < data.recommendedMovieIds.length; i++) {
        const movie = data.recommendedMovieIds[i];
        const response = await fetch(`${MOVIES_SERVICE_URL}/${movie}`);
        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }
        const movieData = await response.json();
        data.recommendedMovieIds[i] = movieData;
      }

      setRecommendation(data.recommendedMovieIds);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  useEffect(() => {
    handleGetDomain();
  }, []);

  useEffect(() => {
    if (currentDomain) {
      fetchRecommendedMovies();
    }
  }, [currentDomain]); // Recalcula cuando currentDomain cambia

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Recommended for you</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {recommendation.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  );
}
