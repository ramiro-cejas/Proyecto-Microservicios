import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const port = process.env.PORT;

const moviesServiceUrl =
  process.env.MOVIES_SERVICE_URL || "http://localhost:3001";
let alreadyFetchedIds = false;
let movieIds: any[] = []; // Specify the type here

app.use(cors());

app.get("/api/random/:count", async (req, res) => {
  try {
    if (!alreadyFetchedIds) {
      try {
        const { data: moviesIds }: { data: string[] } = await axios.get(
          `${moviesServiceUrl}/api/movies/all`
        );
        console.log(moviesIds);
        movieIds = moviesIds;
        alreadyFetchedIds = true;
      } catch (error) {
        return res.status(500).json({ error: "Error fetching movie ids" });
      }
    }

    const count = parseInt(req.params.count);

    const randomMovies: any[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * movieIds.length);
      const randomMovieId = movieIds[randomIndex]._id;
      console.log(randomMovieId);
      try {
        const { data: movie } = await axios.get(
          `${moviesServiceUrl}/api/movies/${randomMovieId}`
        );
        randomMovies.push(movie);
      } catch (error) {
        console.error(`Error fetching movie with id ${randomMovieId}`);
      }
    }

    res.json(randomMovies);
  } catch (error) {
    res.status(500).json({ error: "Error fetching random movies" });
  }
});

app.listen(port, () => {
  console.log(`Random Movies service running on port ${port}`);
});
