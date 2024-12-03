const fs = require("fs");
const path = require("path");

async function getMovies() {
  const fetch = (await import("node-fetch")).default;

  const apiKey = "85f7e87b559acaab2d644558c3ee698f";
  const allMovies = [];
  const totalMovies = 3500;
  const moviesPerPage = 20; // Según la API, devuelve 20 resultados por página
  const totalPages = Math.ceil(totalMovies / moviesPerPage);

  try {
    for (let page = 1; page <= totalPages; page++) {
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es-ES&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        allMovies.push(...data.results);
      } else {
        console.warn(`No data found on page ${page}`);
        break;
      }

      console.log(`Page ${page} fetched, total movies: ${allMovies.length}`);

      // Si alcanzamos o superamos el límite deseado de 10,000 películas, rompemos el bucle
      if (allMovies.length >= totalMovies) break;
    }

    fs.writeFileSync(
      path.join(path.dirname(""), "movies.json"),
      JSON.stringify(allMovies, null, 2)
    );
    console.log("Movies saved in movies.json");
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

getMovies();
