const express = require("express");
const amqp = require("amqplib");
const axios = require("axios");
const cors = require("cors");

// Crear una instancia de Express
const app = express();
const port = process.env.PORT; // Puerto en el que escuchará el servidor

// URL de la API para obtener las películas (configurable más tarde)
let apiUrl = process.env.MOVIES_SERVICE_URL || ""; // Cambiar por la URL real de la API

// Estructura en memoria para almacenar las últimas 5 películas vistas por cada usuario
const userMovieHistory = {};

// Conectar a RabbitMQ y escuchar el canal 'movie_history'
async function startServer() {
  try {
    await connectRabbitMQ();
    await consumeMessages();
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let channel, connection;
const connectRabbitMQ = async () => {
  let retries = 100; // Número de intentos de reconexión
  while (retries) {
    try {
      console.log("Intentando conectar a RabbitMQ...");
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue("movieHistory");
      console.log("Conexión exitosa a RabbitMQ");
      return;
    } catch (error) {
      console.error("Error conectando a RabbitMQ:", error.message);
      retries -= 1;
      console.log(`Reintentando conexión... Intentos restantes: ${retries}`);
      await delay(5000); // Espera 5 segundos antes de reintentar
    }
  }
  console.error("No se pudo conectar a RabbitMQ después de varios intentos.");
  process.exit(1); // Terminar el servicio si no se pudo conectar
};

// Consumir mensajes de la cola 'movieHistory'
const consumeMessages = async () => {
  try {
    channel.consume("movieHistory", async (msg) => {
      if (msg) {
        const movieView = JSON.parse(msg.content.toString());

        // Actualizar el historial de películas del usuario
        await updateUserMovieHistory(movieView.userId, movieView);

        // Confirmar que el mensaje fue procesado
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error al conectar con RabbitMQ o consumir mensajes:", error);
  }
};

// Función para actualizar el historial de películas vistas por el usuario
async function updateUserMovieHistory(userId, movieView) {
  if (!userMovieHistory[userId]) {
    userMovieHistory[userId] = [];
  }

  //Obtener la data de la pelicula desde la API
  const movieData = await axios.get(
    apiUrl + "/api/movies/" + movieView.movieId
  );
  console.log(movieData.data);
  movieView.genres = movieData.data.genre_ids;

  // Verificar si la película ya está en el historial
  const existingMovie = userMovieHistory[userId].find(
    (mv) => mv.movieId === movieView.movieId
  );

  if (existingMovie) {
    // Actualizar la fecha de visualización de la película
    existingMovie.watchedAt = movieView.watchedAt;
    // moverlo al final del array
    userMovieHistory[userId] = userMovieHistory[userId].filter(
      (mv) => mv.movieId !== movieView.movieId
    );
    userMovieHistory[userId].push(existingMovie);
    return;
  }

  // Agregar la nueva película al historial
  userMovieHistory[userId].push(movieView);

  // Mantener solo las últimas 40 películas
  if (userMovieHistory[userId].length > 39) {
    userMovieHistory[userId].shift(); // Elimina la película más antigua
  }
}

app.use(cors());
// Endpoint para obtener las recomendaciones basadas en las últimas 5 películas vistas
app.get("/recommendations/:userId", async (req, res) => {
  const { userId } = req.params;

  // Obtener las recomendaciones de películas para el usuario
  const recommendations = await getMovieRecommendations(userId);

  if (recommendations.length > 0) {
    res.status(200).json({ recommendedMovieIds: recommendations });
  } else {
    res.status(404).json({ message: "No se encontraron recomendaciones." });
  }
});

// Función para obtener las recomendaciones de películas para un usuario
async function getMovieRecommendations(userId) {
  if (!userMovieHistory[userId]) {
    // fetch 5 random movies
    const movies = await getMovies();
    const randomMovies = movies
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((movie) => movie = movie._id);
    console.log(randomMovies);
    return randomMovies;
  }

  // Obtener las últimas películas vistas por el usuario
  const lastMovies = userMovieHistory[userId];

  // Obtener la lista de peliculas con id y generos de la API
  const movies = await getMovies();

  // Obtener los géneros de las películas vistas por el usuario
  console.log(lastMovies);
  const genres = lastMovies.map((movie) => movie.genres).flat();

  // elegir los 3 generos mas vistos
  const uniqueGenres = [...new Set(genres)]
    .map((genre) => ({
      genre,
      count: genres.filter((g) => g === genre).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((genre) => genre.genre);

  // Obtener las recomendaciones basadas en los géneros de las películas vistas
  const recommendations = getRecommendationsByGenres(
    movies,
    uniqueGenres
  ).filter(
    (movie) => !userMovieHistory[userId].some((mv) => mv.movieId === movie._id)
  );

  return recommendations.slice(0, 5).map((movie) => movie._id);
}

// Función para obtener la lista de películas de la API
async function getMovies() {
  try {
    const response = await axios.get(apiUrl + "/api/movies/all");
    return response.data;
  } catch (error) {
    console.error("Error al obtener las películas de la API:", error.message);
    return [];
  }
}

// Función para obtener las recomendaciones basadas en los géneros de las películas vistas
function getRecommendationsByGenres(movies, genres) {
  // Filtrar las películas que coincidan con los géneros vistos por el usuario ordenados por popularidad
  const recommendations = movies
    .filter((movie) => movie.genre_ids.some((genre) => genres.includes(genre)))
    .sort((a, b) => b.popularity - a.popularity);

  return recommendations;
}

// Iniciar el servidor API
app.listen(port, () => {
  console.log(`Servidor API escuchando en http://localhost:${port}`);
  startServer();
});
