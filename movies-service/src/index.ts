import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Movie, { IMovie } from "./models/movie";
const insertMovies = require('./insertMovies');

const app = express();
const port = process.env.PORT || 3001;

insertMovies();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/movies");

app.use(cors());
app.use(express.json());

app.get("/api/movies/all", async (req, res) => {
  const movies = await Movie.find().select("_id genre_ids popularity");
  res.json(movies);
});

app.get("/api/movies/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id.trim());
  if (!movie) return res.status(404).json({ error: "Movie not found" });
  res.json(movie);
});

app.listen(port, () => {
  console.log(`Movies service running on port ${port}`);
});
