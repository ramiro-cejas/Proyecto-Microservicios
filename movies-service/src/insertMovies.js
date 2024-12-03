const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const movieSchema = new mongoose.Schema(
  {
    adult: { type: Boolean, required: true },
    backdrop_path: { type: String, required: false },
    genre_ids: { type: [Number], required: false },
    id: { type: Number, required: true, unique: true }, // Unique constraint para evitar duplicados
    original_language: { type: String, required: true },
    original_title: { type: String, required: true },
    overview: { type: String, required: false },
    popularity: { type: Number, required: false },
    poster_path: { type: String, required: false },
    release_date: { type: String, required: false }, // O puedes usar Date si prefieres tenerlo en formato de fecha
    title: { type: String, required: true },
    video: { type: Boolean, required: true },
    vote_average: { type: Number, required: false },
    vote_count: { type: Number, required: false },
  },
  {
    timestamps: true, // Agrega campos createdAt y updatedAt
  }
);

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

async function insertMovies() {
  try {
    // Conexión a MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/movies",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    // check if the data is already in the database
    // if it's not, insert it
    if ((await Movie.countDocuments()) > 0) {
      console.log("Data already in the database");
      return;
    }

    // Lee el archivo JSON
    const moviesPath = path.join(__dirname, "movies.json");
    const moviesData = JSON.parse(fs.readFileSync(moviesPath, "utf-8"));

    // Inserta los datos en MongoDB
    const result = await Movie.insertMany(moviesData);
    console.log(`${result.length} películas insertadas en la base de datos.`);
  } catch (error) {
    console.error("Error insertando películas en la base de datos:", error);
  }
}

module.exports = insertMovies;
